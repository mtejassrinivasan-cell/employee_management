const { getEmployeeModel, postEmployeeModel, updateEmployeeModel,deleteEmployeeModel,patchEmployeeModel} = require("../model/employee_model");

async function getEmployee(req, res) {

    try {
         
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

module.exports = { getEmployee, postEmployeecontroller, updateEmployeeController, deleteEmployeeController,patchEmployeeController };