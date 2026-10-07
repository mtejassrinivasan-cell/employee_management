import React from 'react';
import { BarChart } from '../Charts';

export const EmployeeDashboard = ({ user, tasks }) => {
  const openTasks = tasks.filter((t) => t.s < 3);

  return (
    <>
      <div className="grid4">
        <div className="card stat">
          <small>Task completion</small>
          <b>78%</b>
          <em>+6% this month</em>
        </div>
        <div className="card stat">
          <small>Performance score</small>
          <b>{user?.score || 88}</b>
          <em>Top 20% tier</em>
        </div>
        <div className="card stat">
          <small>Timeliness index</small>
          <b>92</b>
          <em>+3 pts</em>
        </div>
        <div className="card stat">
          <small>Hours this week</small>
          <b>34.5 h</b>
          <em>Goal: 40 h</em>
        </div>
      </div>

      <div className="two">
        <div className="card pad">
          <div className="row" style={{ marginBottom: '12px', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>Tasks due soon</h3>
            <span className="pill">{openTasks.length} open</span>
          </div>

          {openTasks.slice(0, 5).map((t, idx) => (
            <div
              key={t.id || idx}
              className="row"
              style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}
            >
              <span className="grow" style={{ fontWeight: 600 }}>
                {t.t}
              </span>
              <span className={`pill ${t.p}`}>{t.p}</span>
              <small style={{ color: 'var(--mute)' }}>Due {t.d}</small>
            </div>
          ))}

          {openTasks.length === 0 && (
            <p style={{ color: 'var(--mute)', margin: '14px 0' }}>All tasks are completed!</p>
          )}
        </div>

        <div className="card pad">
          <h3>Monthly performance trend</h3>
          <BarChart values={[72, 78, 81, 85, user?.score || 88]} labels={['Jun', 'Jul', 'Aug', 'Sep', 'Oct']} />
        </div>
      </div>
    </>
  );
};
