const express = require("express");
const employeeRoutes = require("./employee/route/employee_route");

const app = express();

app.use(express.json());
app.use("/api/employees", employeeRoutes);

app.get("/", (req, res) => {
	res.json({ message: "Employee API is running" });
});

module.exports = app;
