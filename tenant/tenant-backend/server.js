const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Make sure to include this
const connection = require('./db'); // Adjust the path if necessary

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.options('*', cors(corsOptions)); // Pre-flight request handling

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


// Middleware to parse JSON request body
app.use(express.json()); // For parsing application/json
// app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Route to check if an IC number exists in the tenant table
app.get('/tenant/IC/:IC', (req, res) => {
  const { IC } = req.params; // Get the IC number from the URL

  const sql = 'SELECT * FROM tenant WHERE IC = ?';
  connection.query(sql, [IC], (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch data' });
      }
      res.status(results.length > 0 ? 200 : 404).json({ exists: results.length > 0 });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Root route
app.get('/', (req, res) => {
  res.send('Server is running!');
});