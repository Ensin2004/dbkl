const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // The default username for MySQL in XAMPP is 'root'
  password: '', // The default password for MySQL in XAMPP is an empty string
  database: 'dbkl' // Replace with the name of your database
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL database!');
});

module.exports = connection;