import React from 'react';
import { BarChart } from '../Charts';

export const AdminOverview = ({ employees, tasks, isDbConnected }) => {
  const availableCount = employees.filter((e) => e.status === 'Available').length;
  const openTasksCount = tasks.filter((t) => t.s < 3).length;
  const avgScore = Math.round(
    employees.reduce((acc, e) => acc + (e.score || 80), 0) / (employees.length || 1)
  );

  const needsAttention = employees.filter((e) => (e.score || 80) < 80);

  return (
    <>
      <div className="grid4">
        <div className="card stat">
          <small>Total employees</small>
          <b>{employees.length}</b>
          <em>{isDbConnected ? 'Synced with MySQL' : 'Active roster'}</em>
        </div>
        <div className="card stat">
          <small>Available now</small>
          <b>{availableCount}</b>
          <em>Ready for tasks</em>
        </div>
        <div className="card stat">
          <small>Open tasks</small>
          <b>{openTasksCount}</b>
          <em>In progress</em>
        </div>
        <div className="card stat">
          <small>Avg. performance</small>
          <b>{avgScore}</b>
          <em>Across company</em>
        </div>
      </div>

      <div className="two">
        <div className="card pad">
          <h3>Team performance benchmark</h3>
          <BarChart
            values={employees.slice(0, 6).map((e) => e.score || 80)}
            labels={employees.slice(0, 6).map((e) => e.first_name || e.name.split(' ')[0])}
          />
        </div>

        <div className="card pad">
          <h3>Employees needing review</h3>
          {needsAttention.slice(0, 5).map((e, idx) => (
            <div
              key={e.emp_id || idx}
              className="row"
              style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}
            >
              <span className="grow" style={{ fontWeight: 600 }}>
                {e.name} <small style={{ color: 'var(--mute)' }}>({e.dept})</small>
              </span>
              <span className="pill High">Score: {e.score || 76}</span>
            </div>
          ))}

          {needsAttention.length === 0 && (
            <p style={{ color: 'var(--mute)', margin: '12px 0' }}>
              All employees meet or exceed the 80+ benchmark score!
            </p>
          )}
        </div>
      </div>
    </>
  );
};
