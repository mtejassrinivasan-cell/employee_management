
const express = require("express");
const {
  getEmployee,
  postEmployeecontroller,
  updateEmployeeController,
  deleteEmployeeController,
  patchEmployeeController,
  savePerformanceController,
  getTasksController,
  addTaskController,
  updateTaskStageController,
  deleteTaskController,
  updateEmployeeStatusController,
  getDocumentsController,
  uploadDocumentController,
  reviewDocumentController,
  deleteDocumentController
} = require("../controller/employee_controller");
const upload = require("../../config/upload");
const router = express.Router();

router.get("/getall", getEmployee);
router.post("/saveemployee", postEmployeecontroller);
router.put("/updateemployee", updateEmployeeController);
router.put("/updateemployee/:emp_id", updateEmployeeController);
router.delete("/deleteemployee/:emp_id", deleteEmployeeController);
router.delete("/deleteemployee", deleteEmployeeController);
router.patch("/patchemployee/:emp_id", patchEmployeeController);
router.patch("/patchemployee", patchEmployeeController);
router.post("/performance/:emp_id", savePerformanceController);
router.post("/performance", savePerformanceController);
router.get("/tasks", getTasksController);
router.post("/tasks", addTaskController);
router.patch("/tasks/:id", updateTaskStageController);
router.delete("/tasks/:id", deleteTaskController);
router.patch("/status/:emp_id", updateEmployeeStatusController);
router.post("/status/:emp_id", updateEmployeeStatusController);
router.patch("/status", updateEmployeeStatusController);
router.post("/status", updateEmployeeStatusController);

// Documents API
router.get("/documents", getDocumentsController);
router.post("/documents/upload", upload.single("file"), uploadDocumentController);
router.patch("/documents/:id/review", reviewDocumentController);
router.delete("/documents/:id", deleteDocumentController);

module.exports = router;
