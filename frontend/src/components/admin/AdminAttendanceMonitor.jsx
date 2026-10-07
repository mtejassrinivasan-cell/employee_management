import React from 'react';

const STAT_COLORS = {
  Available: 'var(--ok)',
  'In Meeting': 'var(--warn)',
  'On Leave': 'var(--bad)',
  'Out for the Day': 'var(--mute)'
};

export const AdminAttendanceMonitor = ({ employees }) => {
  const getCount = (status) => employees.filter((e) => e.status === status).length;

  return (
    <>
      <div className="grid4">
        <div className="card stat">
          <small>Available</small>
          <b>{getCount('Available')}</b>
        </div>
        <div className="card stat">
          <small>In meeting</small>
          <b>{getCount('In Meeting')}</b>
        </div>
        <div className="card stat">
          <small>On leave</small>
          <b>{getCount('On Leave')}</b>
        </div>
        <div className="card stat">
          <small>Out for the day</small>
          <b>{getCount('Out for the Day')}</b>
        </div>
      </div>

      <div className="card pad">
        <div className="row" style={{ marginBottom: '14px', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Live workforce presence</h3>
          <span className="pill">{employees.length} tracked</span>
        </div>

        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>City</th>
                <th>Live Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.emp_id}>
                  <td><b>{e.id || `EMP-${e.emp_id}`}</b></td>
                  <td>{e.name}</td>
                  <td>{e.dept}</td>
                  <td>{e.city}</td>
                  <td>
                    <span
                      className="dot"
                      style={{ background: STAT_COLORS[e.status] || 'var(--mute)' }}
                    ></span>
                    {e.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
