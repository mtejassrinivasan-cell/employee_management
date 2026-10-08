import React, { useState } from 'react';

export const AttendanceView = ({ showToast, onStatusChange, userStatus = 'Available' }) => {
  const isClockedOut = userStatus === 'Out for the Day';

  const handleSetStatus = (newStatus) => {
    if (onStatusChange) onStatusChange(newStatus);
    showToast(`Status updated to ${newStatus}`);
  };

  const handleClockToggle = () => {
    if (isClockedOut) {
      handleSetStatus('Available');
    } else {
      handleSetStatus('Out for the Day');
    }
  };

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const calendarDays = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const wk = (day + 2) % 7;
    let type = 'P';
    if (wk >= 5) type = 'X';
    else if (day === 9) type = 'L';
    else if (day === 14 || day === 21) type = 'W';
    else if (day > 7) type = '';
    return { day, wk, type };
  });

  return (
    <>
      <div className="grid4">
        <div className="card stat">
          <small>Present</small>
          <b>6 days</b>
        </div>
        <div className="card stat">
          <small>Logged hours</small>
          <b>52.4 h</b>
        </div>
        <div className="card stat">
          <small>Leave taken</small>
          <b>1 day</b>
        </div>
        <div className="card stat">
          <small>Remote days</small>
          <b>2 days</b>
        </div>
      </div>

      <div className="two">
        <div className="card pad">
          <h3>October Attendance Calendar</h3>
          
          <div className="cal">
            {daysOfWeek.map((d, i) => (
              <div key={i} className="h">
                {d}
              </div>
            ))}
            {calendarDays.map(({ day, wk, type }) => (
              <div
                key={day}
                className={`${day > 7 ? '' : type} ${wk >= 5 ? 'X' : ''} ${day === 9 ? 'L' : ''} ${
                  day === 14 || day === 21 ? 'W' : ''
                }`}
              >
                <span>{day}</span>
                {wk < 5 && day <= 7 && (
                  <small style={{ fontSize: '10px', opacity: 0.9 }}>09:00–18:00</small>
                )}
              </div>
            ))}
          </div>

          <p style={{ margin: '14px 0 0', fontSize: '12px', color: 'var(--mute)' }}>
            🟢 Green: Present &nbsp;|&nbsp; 🔴 Red: Leave &nbsp;|&nbsp; 🟡 Amber: Remote / WFH &nbsp;|&nbsp; Muted: Weekend
          </p>
        </div>

        <div className="card pad">
          <h3>Today's activity log</h3>
          {[
            ['09:02 AM', 'Available', 'var(--ok)'],
            ['11:00 AM', 'In Meeting', 'var(--warn)'],
            ['12:30 PM', 'Available', 'var(--ok)'],
            ['03:15 PM', 'Available', 'var(--ok)']
          ].map(([time, status, color], idx) => (
            <div
              key={idx}
              className="row"
              style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}
            >
              <small style={{ width: '70px', color: 'var(--mute)', fontWeight: 600 }}>{time}</small>
              <span className="dot" style={{ background: color }}></span>
              {status}
            </div>
          ))}

          <div style={{ marginTop: '18px' }}>
            <div style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 600 }}>
              Live Status:{' '}
              <span
                className="dot"
                style={{
                  background:
                    userStatus === 'Absent'
                      ? 'var(--bad)'
                      : userStatus === 'On Leave'
                      ? 'var(--bad)'
                      : userStatus === 'In Meeting'
                      ? 'var(--warn)'
                      : userStatus === 'Out for the Day'
                      ? 'var(--mute)'
                      : 'var(--ok)'
                }}
              ></span>{' '}
              {userStatus}
            </div>
            <div className="row" style={{ gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <button
                type="button"
                className={`btn ${userStatus === 'Available' || userStatus === 'Present' ? '' : 'ghost'}`}
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => handleSetStatus('Available')}
              >
                🟢 Available / Present
              </button>
              <button
                type="button"
                className={`btn ${userStatus === 'Absent' ? 'danger' : 'ghost'}`}
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => handleSetStatus('Absent')}
              >
                🔴 Mark Absent
              </button>
              <button
                type="button"
                className={`btn ${userStatus === 'In Meeting' ? 'warn' : 'ghost'}`}
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => handleSetStatus('In Meeting')}
              >
                🟡 In Meeting
              </button>
              <button
                type="button"
                className={`btn ${userStatus === 'On Leave' ? 'danger' : 'ghost'}`}
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => handleSetStatus('On Leave')}
              >
                🟠 On Leave
              </button>
            </div>
            <button
              type="button"
              className={`btn full ${isClockedOut ? 'ghost' : ''}`}
              onClick={handleClockToggle}
            >
              {isClockedOut ? 'Clock out (Done at 18:10) · Click to clock back in' : 'Clock out for today'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
