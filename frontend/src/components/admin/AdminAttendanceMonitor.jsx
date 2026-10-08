import React from 'react';

const STAT_COLORS = {
  Available: 'var(--ok)',
  Present: 'var(--ok)',
  Absent: 'var(--bad)',
  'In Meeting': 'var(--warn)',
  'On Leave': 'var(--bad)',
  'Out for the Day': 'var(--mute)'
};

export const AdminAttendanceMonitor = ({ employees, onUpdateStatus, onRefresh, showToast }) => {
  const getCount = (status) => employees.filter((e) => e.status === status).length;
  const presentCount = employees.filter((e) => e.status === 'Available' || e.status === 'Present').length;
  const absentCount = employees.filter((e) => e.status === 'Absent').length;

  return (
    <>
      <div className="grid4">
        <div className="card stat">
          <small>Present / Available</small>
          <b>{presentCount}</b>
        </div>
        <div className="card stat">
          <small>Absent</small>
          <b style={{ color: absentCount > 0 ? 'var(--bad)' : 'inherit' }}>{absentCount}</b>
        </div>
        <div className="card stat">
          <small>In meeting</small>
          <b>{getCount('In Meeting')}</b>
        </div>
        <div className="card stat">
          <small>On leave / Out</small>
          <b>{getCount('On Leave') + getCount('Out for the Day')}</b>
        </div>
      </div>

      <div className="card pad">
        <div className="row" style={{ marginBottom: '14px', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ margin: 0 }}>Live workforce presence</h3>
          <div className="row" style={{ gap: '8px' }}>
            <span className="pill">{employees.length} tracked</span>
            {onRefresh && (
              <button
                type="button"
                className="btn ghost"
                style={{ fontSize: '12px', padding: '4px 10px' }}
                onClick={async () => {
                  if (onRefresh) await onRefresh(true);
                  if (showToast) showToast('Attendance status refreshed from MySQL');
                }}
                title="Refresh from MySQL"
              >
                ⟳ Refresh
              </button>
            )}
          </div>
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
                    {onUpdateStatus ? (
                      <select
                        aria-label={`Live Status for ${e.name}`}
                        value={e.status || 'Available'}
                        onChange={(evt) => onUpdateStatus(evt.target.value, e.emp_id)}
                        style={{
                          background: 'var(--panel)',
                          color: 'var(--text)',
                          border: `1px solid ${STAT_COLORS[e.status] || 'var(--line)'}`,
                          borderRadius: '8px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Available">🟢 Available</option>
                        <option value="Present">🟢 Present</option>
                        <option value="Absent">🔴 Absent</option>
                        <option value="In Meeting">🟡 In Meeting</option>
                        <option value="On Leave">🟠 On Leave</option>
                        <option value="Out for the Day">⚪ Out for the Day</option>
                      </select>
                    ) : (
                      <>
                        <span
                          className="dot"
                          style={{ background: STAT_COLORS[e.status] || 'var(--mute)' }}
                        ></span>
                        {e.status}
                      </>
                    )}
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
