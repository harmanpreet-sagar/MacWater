
const sqlite3 = require('sqlite3').verbose();

// Connects to sqlite3 database and creates a new database file if it does not exist
const db = new sqlite3.Database('macWater.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database: ', err.message);
    } else {
        console.log('Database opened successfully');
    }
})

// Create a table
db.run('CREATE TABLE IF NOT EXISTS locations (Main_Location TEXT, Sub_Location TEXT, Water_Status TEXT)');

// Insert data
function insert_data(mainLocation, subLocation, status) {
    db.run('INSERT INTO locations (Main_Location, Sub_Location, Water_Status) VALUES (?, ?, ?)', [mainLocation, subLocation, status], (err) => {
        if (err) {
            console.error('Error inserting data: ', err.message);
        } else {
            console.log('Data inserted');
        }
    });
}

// Update data
function update_data(mainLocation, subLocation, status) {
    db.run(`UPDATE locations SET Water_Status = ? WHERE Main_Location = ? AND Sub_Location = ?`, [status, mainLocation, subLocation], (err) => {
        if (err) {
            console.error('Error updating data: ', err.message);
        } else {
            console.log('Data updated');
        }
    });
}


function delete_all() {
    // Delete all rows from the table
    db.run('DELETE FROM locations', (err) => {
        if (err) {
            console.error('Error deleting data:', err.message);
        } else {
            console.log('All data deleted');
        }
    });
}

// Delete the specific row based on the user_id
function delete_specific_row(mainLocation) {
    db.run('DELETE FROM locations WHERE Main_Location = ?', [mainLocation], (err) => {
        if (err) {
            console.error('Error deleting data:', err.message);
        } else {
            console.log(`Row with user_id ${mainLocation} deleted`);
        }
    });
}
insert_data('Mills Library', '3rd floor', 'Red');
insert_data('Mills Library', '2nd floor', 'Yellow');
insert_data('Mills Library', '1st floor', 'Green');

insert_data('Thode Library', '2nd floor', 'Red');
insert_data('Thode Library', '1st floor', 'Yellow');
insert_data('John Hodgins Engineering', 'Near H237', 'Green');

// update_data('Mills Library', '3rd floor', 'Green');
// delete_specific_row('Thode Library');

// delete_all();

// Sort by a particular column
function sort_data(sortByColumn) {
    db.all(`SELECT * FROM locations ORDER BY ${sortByColumn}`, (err, rows) => {
        if (err) {
            console.error('Error retrieving data:', err.message);
        } else {
            console.log(`Data Sorted by ${sortByColumn}: `, rows);
        }
    });
}

sort_data('Main_Location');

// Retrieve data
function retrieve_data() {
    db.all('SELECT * FROM locations', (err, rows) => {
        if (err) {
            console.error('Error retrieving data:', err.message);
        } else {
            console.log('Data Retrieved: ', rows);
        }
    });
}

retrieve_data();

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Closed the database connection');
    }
});


