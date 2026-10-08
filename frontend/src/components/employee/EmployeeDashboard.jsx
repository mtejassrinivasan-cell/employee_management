import React from 'react';
import { BarChart } from '../Charts';

export const EmployeeDashboard = ({ user, tasks = [] }) => {
  // Only tasks assigned to this specific employee
  const myTasks = tasks.filter((t) => {
    if (t.emp_id && user?.emp_id && Number(t.emp_id) === Number(user.emp_id)) return true;
    if (t.assignee && user?.name && t.assignee.toLowerCase().includes(user.name.toLowerCase())) return true;
    if (t.assignee && user?.first_name && t.assignee.toLowerCase().includes(user.first_name.toLowerCase())) return true;
    return false;
  });

  const openTasks = myTasks.filter((t) => t.s < 3);
  const completedTasks = myTasks.filter((t) => t.s === 3);
  const completionRate = myTasks.length ? Math.round((completedTasks.length / myTasks.length) * 100) : 100;
  const currentScore = user?.score || 85;

  return (
    <>
      <div className="grid4">
        <div className="card stat">
          <small>Task completion</small>
          <b>{completionRate}%</b>
          <em>{completedTasks.length} of {myTasks.length || 0} completed</em>
        </div>
        <div className="card stat">
          <small>Performance score</small>
          <b>{currentScore}%</b>
          <em>{currentScore >= 80 ? '✓ Meets 80% target' : '⚠ Below benchmark'}</em>
        </div>
        <div className="card stat">
          <small>Pending tasks</small>
          <b>{openTasks.length}</b>
          <em>Assigned to you</em>
        </div>
        <div className="card stat">
          <small>Supervisor review</small>
          <b>{user?.feedback ? 'Reviewed' : 'Pending'}</b>
          <em>{user?.review_date ? String(user.review_date).slice(0, 10) : 'Current cycle'}</em>
        </div>
      </div>

      <div className="two">
        <div className="card pad">
          <div className="row" style={{ marginBottom: '12px', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>My tasks for today</h3>
            <span className="pill">{openTasks.length} active</span>
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
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🎉</span>
              <b style={{ color: 'var(--ink)', fontSize: '15px' }}>There is no task for today</b>
              <p style={{ color: 'var(--mute)', fontSize: '13px', margin: '6px 0 0' }}>
                You have no pending assignments right now. New tasks assigned by management will appear here.
              </p>
            </div>
          )}
        </div>

        <div className="card pad">
          <h3>Monthly performance trend</h3>
          <BarChart
            values={[72, 78, 81, 85, currentScore]}
            labels={['Jun', 'Jul', 'Aug', 'Sep', 'Oct']}
            targetBenchmark={80}
            showTargetLine={true}
          />
        </div>
      </div>
    </>
  );
};
