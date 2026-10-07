const express = require("express");
const http = require("http");
const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, "config/.env") });

const bodyParser = require("body-parser");
const cors = require("cors");

const db = require("./config/db");
const employeeRoutes = require("./employee/route/employee_route");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// CORS
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        return callback(null, true);
    },
    credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "fornt_End")));

// Serve built React app if available at /react
app.use("/react", express.static(path.join(__dirname, "frontend/dist")));

// Routes
app.use("/employees", employeeRoutes);

// Root route to serve employee portal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "fornt_End", "employee.html"));
});

// Start server
async function startServer() {
    try {

        await db.query("SELECT 1");

        console.log("Connected to MySQL successfully!");

        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {

        console.error("Unable to connect to MySQL:", error.message);

        await db.end();

        process.exitCode = 1;
    }
}

startServer();