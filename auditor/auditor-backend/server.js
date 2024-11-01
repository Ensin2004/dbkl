const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser"); // Make sure to include this
const connection = require("./db"); // Adjust the path if necessary

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.options("*", cors(corsOptions)); // Pre-flight request handling

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Middleware to parse JSON request body
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// auditor login route
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // First, check if the email exists
  const queryCheckEmail = "SELECT * FROM auditor WHERE email = ?";

  connection.query(queryCheckEmail, [email], (error, results) => {
    if (error) {
      console.error("Error querying the database:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // If email does not exist
    if (results.length === 0) {
      return res.status(404).json({ message: "Email does not exist" });
    }

    // If email exists, check the password
    const user = results[0]; // Assuming the first result is the user
    if (user.password !== password) {
      return res
        .status(401)
        .json({ message: `Incorrect password for email ${email}` });
    }

    // If everything is correct
    res.status(200).json({ message: "Login successful" });
  });
});

// get tenants' data route
app.get("/api/tenants", (req, res) => {
  const query = "SELECT IC, latitude, longitude, status FROM tenant";

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error fetching tenants:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.status(200).json(results);
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
