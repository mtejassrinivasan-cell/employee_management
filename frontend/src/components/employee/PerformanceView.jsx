import React from 'react';
import { BarChart, RadarChart } from '../Charts';

export const PerformanceView = ({ user }) => {
  return (
    <>
      <div className="grid4">
        <div className="card stat">
          <small>Completion rate</small>
          <b>84%</b>
        </div>
        <div className="card stat">
          <small>Monthly score</small>
          <b>{user?.score || 88}</b>
        </div>
        <div className="card stat">
          <small>Timeliness</small>
          <b>92%</b>
        </div>
        <div className="card stat">
          <small>Reviews received</small>
          <b>4</b>
        </div>
      </div>

      <div className="two">
        <div className="card pad">
          <h3>Score trend (Last 5 Months)</h3>
          <BarChart values={[72, 78, 81, 85, user?.score || 88]} labels={['Jun', 'Jul', 'Aug', 'Sep', 'Oct']} />
        </div>
        <div className="card pad">
          <h3>Skill growth matrix</h3>
          <RadarChart values={[85, 70, 90, 65, 80]} labels={['Backend', 'Security', 'SQL', 'System', 'Teamwork']} />
        </div>
      </div>

      <div className="card pad">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>Latest supervisor evaluation</h3>
          <span
            className="pill"
            style={{
              fontWeight: 700,
              background: (user?.score || 88) >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: (user?.score || 88) >= 80 ? '#10b981' : '#ef4444'
            }}
          >
            Evaluated Score: {user?.score || 88}%
          </span>
        </div>
        <p style={{ margin: 0, color: 'var(--ink)', lineHeight: 1.6, fontStyle: user?.feedback ? 'normal' : 'italic' }}>
          {user?.feedback
            ? `"${user.feedback}"`
            : '"Consistently delivers sprint objectives on time with good attention to detail. Keep focusing on team collaboration and modular testing."'}
        </p>
        <small style={{ display: 'block', marginTop: '10px', color: 'var(--mute)' }}>
          Evaluated by HR &amp; Admin {user?.review_date ? `· ${String(user.review_date).slice(0, 10)}` : '· Active sprint review'}
        </small>
      </div>
    </>
  );
};
