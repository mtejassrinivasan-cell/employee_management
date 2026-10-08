const {
  getEmployeeModel,
  postEmployeeModel,
  updateEmployeeModel,
  deleteEmployeeModel,
  patchEmployeeModel,
  savePerformanceModel,
  getTasksModel,
  addTaskModel,
  updateTaskStageModel,
  deleteTaskModel,
  updateEmployeeStatusModel,
  getDocumentsModel,
  addDocumentModel,
  reviewDocumentModel,
  deleteDocumentModel
} = require("../model/employee_model");

async function getEmployee(req, res) {
    try {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        const result = await getEmployeeModel();
        return res.status(200).json({
            success: true,
            data: result
        });

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching employee data"
        });
    }
}
async function postEmployeecontroller(req,res) {
    const data =req.body
    console.log("jfyjfyfyify",data )
    try {
        const result=await postEmployeeModel(data);
        return res.status(200).json({
            success:true,
            data:result
        });
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success:false,
            message:"Error occured while updating the data"
        });
        
    }

}

async function updateEmployeeController(req, res) {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            success: false,
            message: "Request body is empty! In Postman: select Body -> raw -> select 'JSON' from the dropdown, and enter the employee data."
        });
    }

    const emp_id = req.params.emp_id || data.emp_id;

    if (!emp_id) {
        return res.status(400).json({
            success: false,
            message: "Employee ID (emp_id) is required either in the URL (/updateemployee/:emp_id) or in the request body."
        });
    }

    try {
        const result = await updateEmployeeModel(emp_id, data);
        if (result && result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: `Employee with ID ${emp_id} not found`
            });
        }
        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: result
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating the data",
            error: error.message
        });
    }
}

async function deleteEmployeeController(req, res) {
    const raw_id = req.params.emp_id || (req.body && req.body.emp_id);
    const emp_id = raw_id ? String(raw_id).trim() : null;

    if (!emp_id) {
        return res.status(400).json({
            success: false,
            message: "Employee ID is required in URL (/deleteemployee/:emp_id)"
        });
    }
    try {
        const result = await deleteEmployeeModel(emp_id);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: `Employee with ID ${emp_id} not found`
            });
        }
        return res.status(200).json({
            success: true,
            message: `Employee with ID ${emp_id} deleted successfully`,
            data: result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while deleting employee",
            error: error.message
        });
    }

}


async function patchEmployeeController(req, res) {
    const raw_id = req.params.emp_id || (req.body && req.body.emp_id);
    const emp_id = raw_id ? String(raw_id).trim() : null;
    const data = req.body;
    if (!emp_id) {
        return res.status(400).json({
            success: false,
            message: "Employee ID is required in URL (/patchemployee/:emp_id) or body"
        });
    }
    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            success: false,
            message: "Request body cannot be empty for PATCH"
        });
    }
    try {
        const result = await patchEmployeeModel(emp_id, data);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: `Employee with ID ${emp_id} not found`
            });
        }
        return res.status(200).json({
            success: true,
            message: `Employee with ID ${emp_id} partially updated successfully`,
            data: result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while patching employee",
            error: error.message
        });
    }
}

async function savePerformanceController(req, res) {
    const data = req.body;
    const emp_id = req.params.emp_id || data.emp_id;

    if (!emp_id) {
        return res.status(400).json({
            success: false,
            message: "Employee ID (emp_id) is required"
        });
    }

    try {
        const result = await savePerformanceModel(emp_id, data);
        return res.status(200).json({
            success: true,
            message: `Performance evaluation saved for employee ${emp_id}`,
            data: result
        });
    } catch (error) {
        console.error("Error saving performance evaluation:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while saving performance evaluation",
            error: error.message
        });
    }
}

async function getTasksController(req, res) {
    try {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        const tasks = await getTasksModel();
        return res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return res.status(500).json({ success: false, message: "Error fetching tasks" });
    }
}

async function addTaskController(req, res) {
    try {
        const task = await addTaskModel(req.body);
        return res.status(200).json({ success: true, data: task });
    } catch (error) {
        console.error("Error adding task:", error);
        return res.status(500).json({ success: false, message: "Error adding task" });
    }
}

async function updateTaskStageController(req, res) {
    try {
        const id = req.params.id;
        const stage = req.body.stage !== undefined ? req.body.stage : req.body.s;
        await updateTaskStageModel(id, stage);
        return res.status(200).json({ success: true, message: "Task stage updated" });
    } catch (error) {
        console.error("Error updating task stage:", error);
        return res.status(500).json({ success: false, message: "Error updating task stage" });
    }
}

async function deleteTaskController(req, res) {
    try {
        const id = req.params.id;
        await deleteTaskModel(id);
        return res.status(200).json({ success: true, message: "Task deleted" });
    } catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({ success: false, message: "Error deleting task" });
    }
}

async function updateEmployeeStatusController(req, res) {
    try {
        const emp_id = req.params.emp_id || req.body.emp_id;
        const status = req.body.status || req.body.live_status || 'Available';
        if (!emp_id) {
            return res.status(400).json({ success: false, message: "Employee ID is required" });
        }
        const result = await updateEmployeeStatusModel(emp_id, status);
        return res.status(200).json({ success: true, message: "Status updated successfully", data: result });
    } catch (error) {
        console.error("Error updating employee status:", error);
        return res.status(500).json({ success: false, message: "Error updating employee status" });
    }
}

async function getDocumentsController(req, res) {
    try {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        const docs = await getDocumentsModel();
        return res.status(200).json({
            success: true,
            data: docs
        });
    } catch (error) {
        console.error("Error getting documents:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch documents"
        });
    }
}

async function uploadDocumentController(req, res) {
    try {
        const file = req.file;
        const { title, category, doc_type, uploaded_by, emp_id, status, review_notes } = req.body;

        const docTitle = title || (file ? file.originalname : 'Untitled Document');
        const filePath = file ? `/uploads/${file.filename}` : null;
        const fileSize = file ? file.size : null;
        const mimeType = file ? file.mimetype : null;

        const newDoc = await addDocumentModel({
            title: docTitle,
            category: category || (doc_type === 'broadcast' ? 'Policy' : 'Report'),
            doc_type: doc_type || 'broadcast',
            uploaded_by: uploaded_by || (doc_type === 'broadcast' ? 'HR' : 'Employee'),
            emp_id: emp_id ? Number(emp_id) : null,
            file_path: filePath,
            file_size: fileSize,
            mime_type: mimeType,
            status: status || (doc_type === 'employee_upload' ? 'Pending Review' : 'Published'),
            review_notes: review_notes || null
        });

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            data: newDoc
        });
    } catch (error) {
        console.error("Error uploading document:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload document"
        });
    }
}

async function reviewDocumentController(req, res) {
    try {
        const { id } = req.params;
        const { status, review_notes, reviewed_by } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Document ID is required" });
        }

        const updatedDoc = await reviewDocumentModel(id, {
            status: status || 'Reviewed',
            review_notes: review_notes !== undefined ? review_notes : null,
            reviewed_by: reviewed_by || 'Admin'
        });

        return res.status(200).json({
            success: true,
            message: "Document review saved",
            data: updatedDoc
        });
    } catch (error) {
        console.error("Error reviewing document:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to review document"
        });
    }
}

async function deleteDocumentController(req, res) {
    try {
        const { id } = req.params;
        const result = await deleteDocumentModel(id);
        if (result.doc && result.doc.file_path) {
            const fs = require('fs');
            const path = require('path');
            const fullPath = path.join(__dirname, '../../', result.doc.file_path);
            if (fs.existsSync(fullPath)) {
                try { fs.unlinkSync(fullPath); } catch (e) { console.warn("Failed to unlink file:", e); }
            }
        }
        return res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting document:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete document"
        });
    }
}

module.exports = {
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
};