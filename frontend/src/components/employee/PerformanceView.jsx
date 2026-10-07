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
        <h3>Latest supervisor evaluation</h3>
        <p style={{ margin: 0, color: 'var(--ink)', lineHeight: 1.6 }}>
          "Excellent execution on MySQL database optimization and REST API service development. Consistently meets sprint deliverables on time. Keep focusing on writing modular integration tests."
        </p>
        <small style={{ display: 'block', marginTop: '10px', color: 'var(--mute)' }}>
          Evaluated by Engineering Lead · Oct 04, 2026
        </small>
      </div>
    </>
  );
};
