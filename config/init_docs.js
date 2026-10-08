const db = require('./db');

async function initDocs() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        doc_type ENUM('broadcast', 'employee_upload') NOT NULL DEFAULT 'broadcast',
        uploaded_by VARCHAR(150) NOT NULL,
        emp_id INT NULL,
        file_path VARCHAR(500) NULL,
        file_size INT NULL,
        mime_type VARCHAR(100) NULL,
        status VARCHAR(50) DEFAULT 'Pending Review',
        review_notes TEXT NULL,
        reviewed_by VARCHAR(150) NULL,
        reviewed_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("documents table ready");

    const [rows] = await db.query("SELECT COUNT(*) as count FROM documents");
    if (rows[0].count === 0) {
      await db.query(`
        INSERT INTO documents (title, category, doc_type, uploaded_by, status, created_at)
        VALUES 
          ('Leave policy 2026.pdf', 'Policy', 'broadcast', 'HR', 'Published', '2026-10-01 10:00:00'),
          ('Q3 team performance brief.pdf', 'Report', 'broadcast', 'HR', 'Published', '2026-09-28 10:00:00'),
          ('Code of conduct & ethics.pdf', 'Policy', 'broadcast', 'HR', 'Published', '2026-09-02 10:00:00'),
          ('Employee handbook v3.pdf', 'Manual', 'broadcast', 'HR', 'Published', '2026-08-15 10:00:00'),
          ('Weekly status report.pdf', 'Report', 'employee_upload', 'Tejas M', 'Pending Review', '2026-10-04 14:30:00'),
          ('Architecture diagram v2.png', 'Diagram', 'employee_upload', 'Meera Iyer', 'Approved', '2026-10-02 11:20:00')
      `);
      console.log("Default sample documents inserted into database");
    }
  } catch (error) {
    console.error("Error creating documents table:", error.message);
    throw error;
  }
}

module.exports = initDocs;

if (require.main === module) {
  initDocs().then(() => process.exit(0)).catch(() => process.exit(1));
}
