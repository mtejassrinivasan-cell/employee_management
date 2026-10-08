const db = require("../../config/db");

async function getEmployeeModel() {
    const [rows] = await db.execute(`
        SELECT e.*, pr.quality, pr.timeliness, pr.collaboration, pr.score, pr.feedback, pr.updated_at AS review_date
        FROM employee e
        LEFT JOIN performance_reviews pr ON e.emp_id = pr.emp_id
    `);
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
    if (data.status !== undefined && data.live_status === undefined) {
        data.live_status = data.status;
    }
    const allowedFields = [
        "first_name", "last_name", "hire_date", "salary",
        "experience", "E_mail_id", "city", "reports",
        "deptid", "location", "dept_name", "live_status"
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
    if (data.status !== undefined && data.live_status === undefined) {
        data.live_status = data.status;
    }
    const allowedFields = [
        "first_name", "last_name", "hire_date", "salary",
        "experience", "E_mail_id", "city", "reports",
        "deptid", "location", "dept_name", "live_status"
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

async function savePerformanceModel(emp_id, data) {
    const quality = Number(data.quality) || 85;
    const timeliness = Number(data.timeliness) || 80;
    const collaboration = Number(data.collaboration) || 85;
    const score = Number(data.score) || Math.round((quality + timeliness + collaboration) / 3);
    const feedback = data.feedback || data.notes || '';

    const query = `
        INSERT INTO performance_reviews (emp_id, quality, timeliness, collaboration, score, feedback)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            quality = VALUES(quality),
            timeliness = VALUES(timeliness),
            collaboration = VALUES(collaboration),
            score = VALUES(score),
            feedback = VALUES(feedback),
            updated_at = CURRENT_TIMESTAMP;
    `;
    const [result] = await db.execute(query, [emp_id, quality, timeliness, collaboration, score, feedback]);
    return { emp_id, quality, timeliness, collaboration, score, feedback, affectedRows: result.affectedRows };
}

async function getTasksModel() {
    const [rows] = await db.execute("SELECT * FROM tasks ORDER BY id DESC");
    return rows.map((r) => ({
        id: Number(r.id),
        t: r.title,
        p: r.priority,
        d: r.due_date,
        s: Number(r.stage),
        assignee: r.assignee,
        emp_id: r.emp_id ? Number(r.emp_id) : null
    }));
}

async function addTaskModel(task) {
    const id = task.id || Date.now();
    const query = `
        INSERT INTO tasks (id, title, priority, due_date, stage, assignee, emp_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
        id,
        task.t || task.title || 'Untitled Task',
        task.p || task.priority || 'Medium',
        task.d || task.due_date || 'Today',
        task.s !== undefined ? Number(task.s) : 0,
        task.assignee || 'Unassigned',
        task.emp_id ? Number(task.emp_id) : null
    ]);
    return { id, ...task, affectedRows: result.affectedRows };
}

async function updateTaskStageModel(id, stage) {
    const [result] = await db.execute("UPDATE tasks SET stage = ? WHERE id = ?", [Number(stage), id]);
    return result;
}

async function deleteTaskModel(id) {
    const [result] = await db.execute("DELETE FROM tasks WHERE id = ?", [id]);
    return result;
}

async function updateEmployeeStatusModel(emp_id, status) {
    const [result] = await db.execute("UPDATE employee SET live_status = ? WHERE emp_id = ?", [status, emp_id]);
    try {
        const isPresent = (status === 'Available' || status === 'Present' || status === 'In Meeting') ? 1 : 0;
        await db.execute(
            "INSERT INTO attendance (Attendance_id, status_, date_, emp_id) VALUES (?, ?, CURRENT_DATE, ?) ON DUPLICATE KEY UPDATE status_ = VALUES(status_)",
            [Date.now() % 2147483647, isPresent, emp_id]
        );
    } catch (e) {
        console.warn("Attendance table notice:", e.message);
    }
    return { emp_id, live_status: status, affectedRows: result.affectedRows };
}

async function getDocumentsModel() {
    const query = `
        SELECT 
            id,
            title,
            category,
            doc_type,
            uploaded_by,
            emp_id,
            file_path,
            file_size,
            mime_type,
            status,
            review_notes,
            reviewed_by,
            reviewed_at,
            created_at
        FROM documents
        ORDER BY created_at DESC, id DESC
    `;
    const [rows] = await db.query(query);
    return rows;
}

async function addDocumentModel(doc) {
    const query = `
        INSERT INTO documents (
            title,
            category,
            doc_type,
            uploaded_by,
            emp_id,
            file_path,
            file_size,
            mime_type,
            status,
            review_notes,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await db.execute(query, [
        doc.title || 'Untitled Document',
        doc.category || 'General',
        doc.doc_type || 'broadcast',
        doc.uploaded_by || 'HR',
        doc.emp_id ? Number(doc.emp_id) : null,
        doc.file_path || null,
        doc.file_size ? Number(doc.file_size) : null,
        doc.mime_type || null,
        doc.status || (doc.doc_type === 'employee_upload' ? 'Pending Review' : 'Published'),
        doc.review_notes || null
    ]);

    const [newRows] = await db.query("SELECT * FROM documents WHERE id = ?", [result.insertId]);
    return newRows[0];
}

async function reviewDocumentModel(id, reviewData) {
    const query = `
        UPDATE documents
        SET 
            status = ?,
            review_notes = ?,
            reviewed_by = ?,
            reviewed_at = NOW()
        WHERE id = ?
    `;
    await db.execute(query, [
        reviewData.status || 'Reviewed',
        reviewData.review_notes !== undefined ? reviewData.review_notes : null,
        reviewData.reviewed_by || 'Admin',
        id
    ]);

    const [updatedRows] = await db.query("SELECT * FROM documents WHERE id = ?", [id]);
    return updatedRows[0];
}

async function deleteDocumentModel(id) {
    const [rows] = await db.query("SELECT * FROM documents WHERE id = ?", [id]);
    const doc = rows[0];
    const [result] = await db.execute("DELETE FROM documents WHERE id = ?", [id]);
    return { doc, affectedRows: result.affectedRows };
}

module.exports = {
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
};











