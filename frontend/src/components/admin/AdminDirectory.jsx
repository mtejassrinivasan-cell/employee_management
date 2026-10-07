import React, { useState } from 'react';
import { Icon } from '../../icons';
import { Modal } from '../Modal';

const STAT_COLORS = {
  Available: 'var(--ok)',
  'In Meeting': 'var(--warn)',
  'On Leave': 'var(--bad)',
  'Out for the Day': 'var(--mute)'
};

export const AdminDirectory = ({
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Clean Add Employee Form State (completely blank inputs)
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dept: 'Engineering',
    city: '',
    salary: '',
    experience: ''
  });

  // Edit Employee Form State
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dept: 'Engineering',
    city: '',
    salary: '',
    experience: ''
  });

  const departments = [...new Set(employees.map((e) => e.dept).filter(Boolean))];

  const filtered = employees.filter((e) => {
    const matchesDept = !filterDept || e.dept === filterDept;
    const searchStr = `${e.name} ${e.id || ''} ${e.email || ''} ${e.city || ''}`.toLowerCase();
    return matchesDept && searchStr.includes(searchTerm.toLowerCase());
  });

  const handleOpenAdd = () => {
    setAddForm({
      firstName: '',
      lastName: '',
      email: '',
      dept: 'Engineering',
      city: '',
      salary: '',
      experience: ''
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setEditForm({
      firstName: emp.first_name || '',
      lastName: emp.last_name || '',
      email: emp.email || '',
      dept: emp.dept || 'Engineering',
      city: emp.city || '',
      salary: emp.salary ?? '',
      experience: emp.experience ?? ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (emp) => {
    setSelectedEmp(emp);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.firstName.trim() || !addForm.email.trim()) return;

    await onAddEmployee({
      first_name: addForm.firstName.trim(),
      last_name: addForm.lastName.trim(),
      E_mail_id: addForm.email.trim(),
      dept_name: addForm.dept,
      city: addForm.city.trim() || null,
      location: addForm.city.trim() || null,
      salary: addForm.salary !== '' ? Number(addForm.salary) : null,
      experience: addForm.experience !== '' ? Number(addForm.experience) : null,
      hire_date: new Date().toISOString().slice(0, 10),
      deptid: 1021,
      reports: 101
    });

    setIsAddOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;

    await onEditEmployee(selectedEmp.emp_id, {
      first_name: editForm.firstName.trim(),
      last_name: editForm.lastName.trim(),
      E_mail_id: editForm.email.trim(),
      dept_name: editForm.dept,
      city: editForm.city.trim() || null,
      location: editForm.city.trim() || null,
      salary: editForm.salary !== '' ? Number(editForm.salary) : selectedEmp.salary,
      experience: editForm.experience !== '' ? Number(editForm.experience) : selectedEmp.experience
    });

    setIsEditOpen(false);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedEmp) return;
    await onDeleteEmployee(selectedEmp.emp_id);
    setIsDeleteOpen(false);
  };

  return (
    <>
      <div className="card pad">
        <div
          className="row"
          style={{ marginBottom: '16px', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px' }}
        >
          <div className="row" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <input
              placeholder="Search by name, ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '280px' }}
            />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              style={{ maxWidth: '200px' }}
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="btn" onClick={handleOpenAdd}>
            <Icon name="plus" size={16} /> Add Employee
          </button>
        </div>

        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>City</th>
                <th>Salary</th>
                <th>Live Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.emp_id}>
                  <td><b>{e.id || `EMP-${e.emp_id}`}</b></td>
                  <td>{e.name}</td>
                  <td>{e.dept}</td>
                  <td>{e.city}</td>
                  <td>₹{Number(e.salary || 0).toLocaleString()}</td>
                  <td>
                    <span
                      className="dot"
                      style={{ background: STAT_COLORS[e.status] || 'var(--mute)' }}
                    ></span>
                    {e.status}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn ghost"
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                      onClick={() => handleOpenEdit(e)}
                    >
                      <Icon name="edit" size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn danger"
                      style={{ padding: '5px 10px', fontSize: '12px', marginLeft: '6px' }}
                      onClick={() => handleOpenDelete(e)}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--mute)' }}>
                    No employees matching "{searchTerm}" found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal (Completely Blank Inputs) */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Employee">
        <form onSubmit={handleAddSubmit}>
          <div className="fields">
            <div>
              <label>First Name *</label>
              <input
                placeholder="Enter first name"
                value={addForm.firstName}
                onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div>
              <label>Last Name</label>
              <input
                placeholder="Enter last name"
                value={addForm.lastName}
                onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
              />
            </div>
          </div>

          <label>Work Email *</label>
          <input
            type="email"
            placeholder="name@company.com"
            value={addForm.email}
            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            required
          />

          <div className="fields">
            <div>
              <label>Department</label>
              <select
                value={addForm.dept}
                onChange={(e) => setAddForm({ ...addForm, dept: e.target.value })}
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div>
              <label>City / Location</label>
              <input
                placeholder="Enter city / location"
                value={addForm.city}
                onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
              />
            </div>
          </div>

          <div className="fields">
            <div>
              <label>Salary (₹ / yr)</label>
              <input
                type="number"
                placeholder="Enter annual salary"
                value={addForm.salary}
                onChange={(e) => setAddForm({ ...addForm, salary: e.target.value })}
              />
            </div>
            <div>
              <label>Experience (yrs)</label>
              <input
                type="number"
                placeholder="Enter years of experience"
                value={addForm.experience}
                onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
              />
            </div>
          </div>

          <div className="row" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Save Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Employee (${selectedEmp?.id || `EMP-${selectedEmp?.emp_id}`})`}
      >
        <form onSubmit={handleEditSubmit}>
          <div className="fields">
            <div>
              <label>First Name</label>
              <input
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Last Name</label>
              <input
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              />
            </div>
          </div>

          <label>Work Email</label>
          <input
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            required
          />

          <div className="fields">
            <div>
              <label>Department</label>
              <select
                value={editForm.dept}
                onChange={(e) => setEditForm({ ...editForm, dept: e.target.value })}
              >
                {['Engineering', 'Design', 'Operations', 'Finance', 'HR', 'sales', 'support', 'development'].map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label>City / Location</label>
              <input
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              />
            </div>
          </div>

          <div className="fields">
            <div>
              <label>Salary (₹)</label>
              <input
                type="number"
                value={editForm.salary}
                onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
              />
            </div>
            <div>
              <label>Experience (yrs)</label>
              <input
                type="number"
                value={editForm.experience}
                onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
              />
            </div>
          </div>

          <div className="row" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost" onClick={() => setIsEditOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Update
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Deletion">
        <p style={{ margin: '14px 0 20px', color: 'var(--mute)', lineHeight: 1.5 }}>
          Are you sure you want to delete <b>{selectedEmp?.name}</b> (
          {selectedEmp?.id || `EMP-${selectedEmp?.emp_id}`})? This action will permanently remove the record from the MySQL database.
        </p>

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn ghost" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn danger" onClick={handleDeleteSubmit}>
            Delete Employee
          </button>
        </div>
      </Modal>
    </>
  );
};
