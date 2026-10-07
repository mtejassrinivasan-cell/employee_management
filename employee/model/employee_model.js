const db = require("../../config/db");

async function getEmployeeModel() {
    const [rows] = await db.execute("SELECT * FROM employee");
    return rows;
}
async function postEmployeeModel(data) {
    let emp_id = data.emp_id !== undefined && data.emp_id !== "" ? Number(data.emp_id) : null;
    if (!emp_id) {
        const [maxRows] = await db.execute("SELECT COALESCE(MAX(emp_id), 100) + 1 AS next_id FROM employee");
        emp_id = maxRows[0].next_id;
    }
    const email = data.E_mail_id || data.email || data.email_id || `emp${emp_id}@company.com`;
    const hireDate = data.hire_date ? String(data.hire_date).slice(0, 10) : new Date().toISOString().slice(0, 10);

    const qurey = `
    INSERT INTO employee(
        emp_id,first_name,last_name,hire_date,
        salary,experience,E_mail_id,city,
        reports,deptid,location,dept_name
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`;
    
    const values = [
        emp_id,
        data.first_name || 'Employee',
        data.last_name || '',
        hireDate,
        data.salary !== undefined && data.salary !== "" ? Number(data.salary) : 50000,
        data.experience !== undefined && data.experience !== "" ? Number(data.experience) : 1,
        email,
        data.city || 'Remote',
        data.reports !== undefined && data.reports !== "" ? Number(data.reports) : 101,
        data.deptid !== undefined && data.deptid !== "" ? Number(data.deptid) : 1021,
        data.location || data.city || 'Remote',
        data.dept_name || 'Engineering'
    ];  

    const [result] = await db.execute(qurey, values);
    console.log("employee added successfully with emp_id:", emp_id);
    return { ...result, emp_id };
}
async function updateEmployeeModel(emp_id, data) {
    // Support common alias names for email
    const email = data.E_mail_id || data.email || data.email_id;
    if (email) {
        data.E_mail_id = email;
    }

    // Allowed database columns that can be updated
    const allowedFields = [
        "first_name", "last_name", "hire_date", "salary",
        "experience", "E_mail_id", "city", "reports",
        "deptid", "location", "dept_name"
    ];

    const fieldsToUpdate = [];
    const values = [];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            fieldsToUpdate.push(`${field} = ?`);
            values.push(data[field]);
        }
    }

    if (fieldsToUpdate.length === 0) {
        throw new Error("No valid fields provided to update.");
    }

    values.push(emp_id);
    const query = `UPDATE employee SET ${fieldsToUpdate.join(", ")} WHERE emp_id = ?;`;

    const [result] = await db.execute(query, values);
    console.log("employee updated successfully");
    return result;
}

async function deleteEmployeeModel(emp_id) {
    const query=`
    DELETE FROM employee WHERE emp_id=?;
    `;
    const [result] = await db.execute(query, [emp_id]);
    console.log("employee deleted successfully");
    return result;
}
// employee/model/employee_model.js
async function patchEmployeeModel(emp_id, data) {
    // Map common aliases for email
    const email = data.E_mail_id || data.email || data.email_id;
    if (email) data.E_mail_id = email;
    const allowedFields = [
        "first_name", "last_name", "hire_date", "salary",
        "experience", "E_mail_id", "city", "reports",
        "deptid", "location", "dept_name"
    ];
    const fieldsToUpdate = [];
    const values = [];
    // Only include fields that the client sent
    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            fieldsToUpdate.push(`${field} = ?`);
            values.push(data[field]);
        }
    }
    if (fieldsToUpdate.length === 0) {
        throw new Error("No valid fields provided to patch.");
    }
    values.push(emp_id);
    const query = `UPDATE employee SET ${fieldsToUpdate.join(", ")} WHERE emp_id = ?;`;
    const [result] = await db.execute(query, values);
    console.log("employee patched successfully");
    return result;
}
module.exports = { getEmployeeModel,postEmployeeModel,updateEmployeeModel,deleteEmployeeModel,patchEmployeeModel };











