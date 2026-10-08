import React, { useState } from 'react';
import { Icon } from '../../icons';
import { Modal } from '../Modal';

const COLS = ['To Do', 'In Progress', 'Under Review', 'Completed'];

export const AdminTaskAllocation = ({ tasks, employees, onAssignTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const handleToggleEmp = (empName) => {
    if (selectedEmployees.includes(empName)) {
      setSelectedEmployees(selectedEmployees.filter((n) => n !== empName));
    } else {
      setSelectedEmployees([...selectedEmployees, empName]);
    }
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matched = employees.find((emp) => selectedEmployees.includes(emp.name));

    onAssignTask({
      id: Date.now(),
      t: title.trim(),
      p: priority,
      d: deadline.trim() || 'TBD',
      s: 0,
      assignee: selectedEmployees.join(', ') || 'Unassigned',
      emp_id: matched ? matched.emp_id : null
    });

    setTitle('');
    setPriority('Medium');
    setDeadline('');
    setSelectedEmployees([]);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: '14px' }}>
        <p style={{ margin: 0, color: 'var(--mute)' }}>
          Assign daily or sprint tasks with deadlines, assignees and priorities.
        </p>
        <button type="button" className="btn" onClick={() => setIsModalOpen(true)}>
          <Icon name="plus" size={16} /> Assign new task
        </button>
      </div>

      <div className="card pad">
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Assignee</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Current Stage</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td><b>{t.t}</b></td>
                  <td>{t.assignee || 'Unassigned'}</td>
                  <td><span className={`pill ${t.p}`}>{t.p}</span></td>
                  <td>{t.d}</td>
                  <td><span className="pill">{COLS[t.s]}</span></td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--mute)' }}>
                    <span style={{ fontSize: '26px', display: 'block', marginBottom: '8px' }}>📝</span>
                    <b>No active tasks in system</b>
                    <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
                      Click "Assign new task" above to assign work to team members.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Task">
        <form onSubmit={handleAssign}>
          <label>Title *</label>
          <input
            placeholder="e.g. Implement Payment Gateway"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="fields">
            <div>
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label>Deadline</label>
              <input
                placeholder="e.g. Oct 25"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <label>Assign to employee(s)</label>
          <div className="picks">
            {employees.map((e) => (
              <label key={e.emp_id}>
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(e.name)}
                  onChange={() => handleToggleEmp(e.name)}
                />
                {e.name} ({e.dept})
              </label>
            ))}
          </div>

          <div className="row" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn">
              Assign task
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
