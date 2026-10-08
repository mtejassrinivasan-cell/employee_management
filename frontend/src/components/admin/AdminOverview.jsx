import React from 'react';
import { BarChart } from '../Charts';

export const AdminOverview = ({ employees, tasks, isDbConnected }) => {
  const availableCount = employees.filter((e) => e.status === 'Available' || e.status === 'Present').length;
  const openTasksCount = tasks.filter((t) => t.s < 3).length;
  const avgScore = Math.round(
    employees.reduce((acc, e) => acc + (e.score || 80), 0) / (employees.length || 1)
  );

  const needsAttention = employees.filter((e) => (e.score || 80) < 80);

  const chartData =
    employees.length === 1
      ? {
          values: [employees[0].score || 88, 80],
          labels: [employees[0].first_name || employees[0].name.split(' ')[0], 'Target'],
          subtitles: [employees[0].dept || 'Engineering', 'Benchmark'],
          colors: ['url(#barGradPrimary)', 'url(#barGradBenchmark)']
        }
      : {
          values: employees.slice(0, 6).map((e) => e.score || 80),
          labels: employees.slice(0, 6).map((e) => e.first_name || e.name.split(' ')[0]),
          subtitles: employees.slice(0, 6).map((e) => e.dept || 'Engineering'),
          colors: []
        };

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
          <div className="row" style={{ alignItems: 'flex-start', marginBottom: '14px' }}>
            <div className="grow">
              <h3 style={{ margin: 0, fontSize: '16px' }}>Team performance benchmark</h3>
              <small style={{ color: 'var(--mute)', display: 'block', marginTop: '2px' }}>
                {employees.length === 1
                  ? `${employees[0].name} evaluated against company benchmark (80%)`
                  : 'Individual employee performance evaluated against 80% target'}
              </small>
            </div>
            <span
              className="pill Low"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: 'rgba(245, 158, 11, 0.14)',
                color: '#d97706',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              Benchmark: 80%
            </span>
          </div>

          <BarChart
            values={chartData.values}
            labels={chartData.labels}
            subtitles={chartData.subtitles}
            colors={chartData.colors}
            targetBenchmark={80}
            showTargetLine={true}
          />

          <div
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: 'var(--soft)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12.5px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px' }}>🎯</span>
              <span>
                <b>{employees[0]?.name || 'Employee'}</b> score is{' '}
                <b style={{ color: 'var(--p2)' }}>{employees[0]?.score || avgScore}%</b>{' '}
                ({(employees[0]?.score || avgScore) >= 80 ? 'exceeds target by +' : 'below target by -'}
                {Math.abs((employees[0]?.score || avgScore) - 80)} pts)
              </span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--mute)', fontSize: '11.5px' }}>
              {employees.filter((e) => (e.score || 80) >= 80).length} / {employees.length || 1} passing
            </span>
          </div>
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
