
const express = require("express");
const { getEmployee, postEmployeecontroller, updateEmployeeController, deleteEmployeeController,patchEmployeeController } = require("../controller/employee_controller");
const router = express.Router();

router.get("/getall", getEmployee);
router.post("/saveemployee",postEmployeecontroller);
router.put("/updateemployee", updateEmployeeController);
router.put("/updateemployee/:emp_id", updateEmployeeController);
router.delete("/deleteemployee/:emp_id", deleteEmployeeController);
router.delete("/deleteemployee", deleteEmployeeController);
router.patch("/patchemployee/:emp_id", patchEmployeeController);
router.patch("/patchemployee", patchEmployeeController);
module.exports = router;
