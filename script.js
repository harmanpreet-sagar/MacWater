const STATUS = document.getElementById('status');
const VIDEO = document.getElementById('webcam');
const ENABLE_CAM_BUTTON = document.getElementById('enableCam');
const LOAD_BUTTON = document.getElementById('load');
const BUBBLES_CONTAINER = document.querySelector('.water-bubbles-container');


const MOBILE_NET_INPUT_WIDTH = 224;
const MOBILE_NET_INPUT_HEIGHT = 224;
const STOP_DATA_GATHER = -1;
const CLASS_NAMES = ['clean', 'moderate', 'poor'];



ENABLE_CAM_BUTTON.addEventListener('click', enableCam);
LOAD_BUTTON.addEventListener('click', load);



let mobilenet = undefined;
let gatherDataState = STOP_DATA_GATHER;
let videoPlaying = false;
let trainingDataInputs = [];
let trainingDataOutputs = [];
let examplesCount = [];
let predict = false;


// Your existing JavaScript code

// Create water bubbles dynamically
for (let i = 0; i < 10; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('water-bubble');
    bubble.style.width = `${Math.random() * 20 + 10}px`; // Random size between 10px and 30px
    bubble.style.height = bubble.style.width;
    bubble.style.left = `${Math.random() * 100}%`; // Random horizontal position
    bubble.style.animationDuration = `${Math.random() * 2 + 1}s`; // Random animation duration
    BUBBLES_CONTAINER.appendChild(bubble);
}


function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }


function enableCam() {
    if (hasGetUserMedia()) {
        // getUsermedia parameters.
        const constraints = {
          video: true,
          
          width: 640, 
          height: 480 
        };
    
        // Activate the webcam stream.
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
          VIDEO.srcObject = stream;
          VIDEO.addEventListener('loadeddata', function() {
            videoPlaying = true;
            ENABLE_CAM_BUTTON.classList.add('removed');
          });
        });
      } else {
        console.warn('getUserMedia() is not supported by your browser');
      }
}

function dataGatherLoop() {
    if (videoPlaying && gatherDataState !== STOP_DATA_GATHER) {
      let imageFeatures = tf.tidy(function() {
        let videoFrameAsTensor = tf.browser.fromPixels(VIDEO);
        let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor, [MOBILE_NET_INPUT_HEIGHT, 
            MOBILE_NET_INPUT_WIDTH], true);
        let normalizedTensorFrame = resizedTensorFrame.div(255);
        return mobilenet.predict(normalizedTensorFrame.expandDims()).squeeze();
      });
  
      trainingDataInputs.push(imageFeatures);
      trainingDataOutputs.push(gatherDataState);
      
      // Intialize array index element if currently undefined.
      if (examplesCount[gatherDataState] === undefined) {
        examplesCount[gatherDataState] = 0;
      }
      examplesCount[gatherDataState]++;
  
      STATUS.innerText = '';
      for (let n = 0; n < CLASS_NAMES.length; n++) {
        STATUS.innerText += CLASS_NAMES[n] + ' data count: ' + examplesCount[n] + '. ';
      }
      window.requestAnimationFrame(dataGatherLoop);
    }
  }


function reset() {
    predict = false;
    examplesCount.length = 0;
    for (let i = 0; i < trainingDataInputs.length; i++) {
      trainingDataInputs[i].dispose();
    }
    trainingDataInputs.length = 0;
    trainingDataOutputs.length = 0;
    STATUS.innerText = 'No data collected';
    
    console.log('Tensors in memory: ' + tf.memory().numTensors);
}



function gatherDataForClass() {
    let classNumber = parseInt(this.getAttribute('data-1hot'));
    gatherDataState = (gatherDataState === STOP_DATA_GATHER) ? classNumber : STOP_DATA_GATHER;
    dataGatherLoop();
}


/**
 * Loads the MobileNet model and warms it up so ready for use.
 **/
async function loadMobileNetFeatureModel() {
    const URL = 
      'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';
    
    mobilenet = await tf.loadGraphModel(URL, {fromTFHub: true});
    STATUS.innerText = 'MobileNet v3 loaded successfully!';
    
    // Warm up the model by passing zeros through it once.
    tf.tidy(function () {
      let answer = mobilenet.predict(tf.zeros([1, MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH, 3]));
      console.log(answer.shape);
    });
  }


  async function trainAndPredict() {
    predict = false;
    tf.util.shuffleCombo(trainingDataInputs, trainingDataOutputs);
    let outputsAsTensor = tf.tensor1d(trainingDataOutputs, 'int32');
    let oneHotOutputs = tf.oneHot(outputsAsTensor, CLASS_NAMES.length);
    let inputsAsTensor = tf.stack(trainingDataInputs);
    
    let results = await model.fit(inputsAsTensor, oneHotOutputs, {shuffle: true, batchSize: 5, epochs: 10, 
        callbacks: {onEpochEnd: logProgress} });
    
    outputsAsTensor.dispose();
    oneHotOutputs.dispose();
    inputsAsTensor.dispose();
    predict = true;
    predictLoop(model);
  }


  async function predictLoop(model) {
    while (predict) {
      await tf.nextFrame(); // Wait for the next animation frame
      tf.tidy(function() {
        let videoFrameAsTensor = tf.browser.fromPixels(VIDEO).div(255);
        let resizedTensorFrame = tf.image.resizeBilinear(videoFrameAsTensor, [MOBILE_NET_INPUT_HEIGHT, MOBILE_NET_INPUT_WIDTH], true);
    
        let imageFeatures = mobilenet.predict(resizedTensorFrame.expandDims());
        let prediction = model.predict(imageFeatures).squeeze();
        let highestIndex = prediction.argMax().arraySync();
        let predictionArray = prediction.arraySync();
  
        let classification = CLASS_NAMES[highestIndex]; 

        let confidence = Math.floor(predictionArray[highestIndex] * 100); 
        if (confidence > 98)
        {
          STATUS.innerText = 'Prediction: ' + CLASS_NAMES[highestIndex] + ' with ' + Math.floor(predictionArray[highestIndex] * 100) + '% confidence';
          console.log("PREDICTION BASED: ", classification);
          predict = false; 
          return CLASS_NAMES[highestIndex];
        }

        else{
          STATUS.innerText = 'Prediction: Not confident enough to make a prediction'
          console.log("Not confident to make a prediction");
        }
      });
    }
  }

  // function logProgress(epoch, logs) {
  //   console.log('Data for epoch ' + epoch, logs);
  // }
  
  // Call the function immediately to start loading.
  loadMobileNetFeatureModel();

//   let model = tf.sequential();
// model.add(tf.layers.dense({inputShape: [1024], units: 128, activation: 'relu'}));
// model.add(tf.layers.dense({units: CLASS_NAMES.length, activation: 'softmax'}));


// // Compile the model with the defined optimizer and specify a loss function to use.
// model.compile({
//   // Adam changes the learning rate over time which is useful.
//   optimizer: 'adam',
//   // Use the correct loss function. If 2 classes of data, must use binaryCrossentropy.
//   // Else categoricalCrossentropy is used if more than 2 classes.
//   loss: (CLASS_NAMES.length === 2) ? 'binaryCrossentropy': 'categoricalCrossentropy', 
//   // As this is a classification problem you can record accuracy in the logs too!
//   metrics: ['accuracy']  
// });


// model.summary()

// function save(){
//     model.save('downloads://my-model');
// }



//! NEW CODE STUFF
async function load() {
  try {
    console.log("Preloading model...");
    const newModel = await tf.loadLayersModel('http://127.0.0.1:5500/my-model.json');
    console.log("Model loaded successfully");

    // Start using the loaded model
    predict = true;
    await predictLoop(newModel); // Wait for predictLoop to complete
  } catch (error) {
    console.error("Error loading the model:", error);
  }
}





