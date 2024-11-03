const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Make sure to include this
const connection = require('./db'); // Adjust the path if necessary
const fs = require('fs');
const path = require('path');
const axios = require('axios');
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

// Route to fetch latitude and longitude from the database using IC number
app.get('/tenant/location/:ic', (req, res) => {
  const { ic } = req.params;

  const sql = 'SELECT latitude, longitude FROM tenant WHERE IC = ?';
  connection.query(sql, [ic], (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to fetch location data' });
      }

      if (results.length > 0) {
          const { latitude, longitude } = results[0]; 
          res.status(200).json({
              storedLatitude: latitude,
              storedLongitude: longitude,
          });
      } else {
          res.status(404).json({ message: 'IC not found' });
      }
  });
});

// Route to fetch the image based on IC number
app.get('/tenant/fetch-image/:ic', (req, res) => {
  const { ic } = req.params;
  console.log(`Fetching image for IC: ${ic}`); // Debugging line

  const sql = 'SELECT image_url FROM tenant WHERE IC = ?';
  connection.query(sql, [ic], (err, results) => {
      if (err) {
          console.error('Database error:', err); // Log database error
          return res.status(500).json({ error: 'Failed to fetch image data' });
      }

      // Log query results
      console.log(`Query executed for IC: ${ic}. Results: ${JSON.stringify(results)}`); 

      if (results.length > 0 && results[0].image_url) {
          // Log the image URL
          console.log('Image URL found:', results[0].image_url); 
          const imagePath = path.join(__dirname, '../tenant-backend/assets/tenantImg', results[0].image_url);
          
          // Debugging line to check the path
          console.log('Image Path:', imagePath);

          if (!fs.existsSync(imagePath)) {
              // Log if file not found
              console.warn(`No image file found on server at path: ${imagePath}`);
              return res.status(404).json({ message: 'Image not found on server' });
          }

          // Read the image file and send as a base64 encoded string
          fs.readFile(imagePath, (err, data) => {
              if (err) {
                  console.error('Error reading image file:', err);
                  return res.status(500).json({ error: 'Failed to read image file' });
              }

              // Convert image to base64
              const base64Image = Buffer.from(data).toString('base64');
              res.json({ image: base64Image });
          });
      } else {
          // Log if no image is found
          console.warn(`No image found for IC: ${ic}`); 
          res.status(404).json({ message: 'Image not found' });
      }
  });
});

// Route to update the tenant status in the database
app.put('/tenant/update-status/:ic', (req, res) => {
  console.log(`Received request to update status for IC: ${req.params.ic}`); // Log the IC received

  console.log(`Request body:`, req.body); // Log the request body

  const { ic } = req.params; // Get the IC number from the URL
  const { status } = req.body; // Get the status from the request body

  // Validate the status
  if (!['success', 'failed', 'incomplete'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
  }

  const sql = 'UPDATE tenant SET status = ? WHERE IC = ?';
  connection.query(sql, [status, ic], (err, results) => {
      if (err) {
          console.error('Error updating status:', err); // Log database error
          return res.status(500).json({ error: 'Failed to update status', details: err.message });
      }
      if (results.affectedRows > 0) {
          res.status(200).json({ message: 'Status updated successfully' });
      } else {
          console.warn('IC not found:', ic); // Log if IC not found
          res.status(404).json({ message: 'IC not found' });
      }
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