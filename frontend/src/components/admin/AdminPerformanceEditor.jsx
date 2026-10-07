import React, { useState } from 'react';

export const AdminPerformanceEditor = ({ employees, showToast }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeEmp = employees[selectedIdx] || employees[0];

  const [quality, setQuality] = useState(activeEmp?.score || 85);
  const [timeliness, setTimeliness] = useState(Math.max(0, (activeEmp?.score || 85) - 4));
  const [collaboration, setCollaboration] = useState(Math.min(100, (activeEmp?.score || 85) + 3));
  const [notes, setNotes] = useState('');

  const handleSelectEmp = (idx) => {
    setSelectedIdx(idx);
    const emp = employees[idx];
    if (emp) {
      setQuality(emp.score || 85);
      setTimeliness(Math.max(0, (emp.score || 85) - 4));
      setCollaboration(Math.min(100, (emp.score || 85) + 3));
      setNotes('');
    }
  };

  const handleSaveEvaluation = () => {
    showToast(`Evaluation saved for ${activeEmp?.name}`);
  };

  const handleGenerateReport = () => {
    showToast(`Performance report generated for ${activeEmp?.name}`);
  };

  return (
    <div className="two">
      <div className="card pad">
        <div className="row" style={{ marginBottom: '14px', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Employee Roster</h3>
          <span className="pill">{employees.length} total</span>
        </div>

        <div style={{ display: 'grid', gap: '6px', maxHeight: '460px', overflowY: 'auto' }}>
          {employees.map((e, idx) => (
            <button
              key={e.emp_id || idx}
              type="button"
              className={`nav ${selectedIdx === idx ? 'on' : ''}`}
              onClick={() => handleSelectEmp(idx)}
            >
              <span className="grow">{e.name}</span>
              <span className="pill">{e.score || 85}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card pad">
        {activeEmp ? (
          <>
            <h3>
              {activeEmp.name} · {activeEmp.dept}
            </h3>

            <div className="range">
              <span>Quality &amp; Delivery</span>
              <input
                type="range"
                min="0"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
              <b>{quality}</b>
            </div>

            <div className="range">
              <span>Sprint Velocity</span>
              <input
                type="range"
                min="0"
                max="100"
                value={timeliness}
                onChange={(e) => setTimeliness(Number(e.target.value))}
              />
              <b>{timeliness}</b>
            </div>

            <div className="range">
              <span>Collaboration</span>
              <input
                type="range"
                min="0"
                max="100"
                value={collaboration}
                onChange={(e) => setCollaboration(Number(e.target.value))}
              />
              <b>{collaboration}</b>
            </div>

            <label style={{ marginTop: '16px' }}>Performance Review Comments</label>
            <textarea
              rows="3"
              placeholder={`Write coaching feedback for ${activeEmp.first_name || activeEmp.name}...`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="row" style={{ marginTop: '18px' }}>
              <button type="button" className="btn" onClick={handleSaveEvaluation}>
                Save evaluation
              </button>
              <button type="button" className="btn ghost" onClick={handleGenerateReport}>
                Generate PDF report
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--mute)' }}>Select an employee to edit performance.</p>
        )}
      </div>
    </div>
  );
};
