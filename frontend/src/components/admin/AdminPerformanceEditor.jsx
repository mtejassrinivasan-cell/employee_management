import React, { useState, useEffect } from 'react';

export const AdminPerformanceEditor = ({ employees = [], onSavePerformance, showToast }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeEmp = employees[selectedIdx] || employees[0];

  const [quality, setQuality] = useState(85);
  const [timeliness, setTimeliness] = useState(80);
  const [collaboration, setCollaboration] = useState(85);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever selected employee changes
  useEffect(() => {
    if (activeEmp) {
      setQuality(activeEmp.quality !== undefined ? activeEmp.quality : (activeEmp.score || 85));
      setTimeliness(
        activeEmp.timeliness !== undefined
          ? activeEmp.timeliness
          : Math.max(50, (activeEmp.score || 85) - 4)
      );
      setCollaboration(
        activeEmp.collaboration !== undefined
          ? activeEmp.collaboration
          : Math.min(100, (activeEmp.score || 85) + 3)
      );
      setNotes(activeEmp.feedback || '');
    }
  }, [activeEmp?.emp_id, activeEmp?.score, activeEmp?.feedback]);

  const handleSelectEmp = (idx) => {
    setSelectedIdx(idx);
  };

  const overallScore = Math.round((quality + timeliness + collaboration) / 3);
  const isPassingBenchmark = overallScore >= 80;

  const handleSaveEvaluation = async () => {
    if (!activeEmp?.emp_id) {
      showToast('Please select an employee first');
      return;
    }

    setIsSaving(true);
    try {
      if (onSavePerformance) {
        await onSavePerformance(activeEmp.emp_id, {
          quality,
          timeliness,
          collaboration,
          score: overallScore,
          feedback: notes.trim()
        });
      } else {
        showToast(`Evaluation saved for ${activeEmp.name}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving evaluation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateReport = () => {
    const reportText = `Performance Report: ${activeEmp?.name} (${activeEmp?.dept})\nOverall Score: ${overallScore}%\nQuality: ${quality}%\nTimeliness: ${timeliness}%\nCollaboration: ${collaboration}%\nFeedback: ${notes || 'No review notes entered.'}`;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Performance_Report_${activeEmp?.first_name || 'Employee'}_${activeEmp?.emp_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Performance report downloaded for ${activeEmp?.name}`);
  };

  return (
    <div className="two">
      <div className="card pad">
        <div className="row" style={{ marginBottom: '14px', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0 }}>Employee Roster</h3>
            <small style={{ color: 'var(--mute)' }}>Select team member to evaluate</small>
          </div>
          <span className="pill">{employees.length} total</span>
        </div>

        <div style={{ display: 'grid', gap: '6px', maxHeight: '460px', overflowY: 'auto' }}>
          {employees.map((e, idx) => (
            <button
              key={e.emp_id || idx}
              type="button"
              className={`nav ${selectedIdx === idx ? 'on' : ''}`}
              onClick={() => handleSelectEmp(idx)}
              style={{ display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left' }}
            >
              <span className="grow">
                <b>{e.name}</b>
                <small style={{ display: 'block', color: 'var(--mute)', fontSize: '11px' }}>
                  {e.dept}
                </small>
              </span>
              <span
                className={`pill ${(e.score || 85) >= 80 ? 'Low' : 'High'}`}
                style={{ fontWeight: 700 }}
              >
                {e.score || 85}%
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="card pad">
        {activeEmp ? (
          <>
            <div
              className="row"
              style={{
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                borderBottom: '1px solid var(--line)',
                paddingBottom: '12px'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '17px' }}>{activeEmp.name}</h3>
                <small style={{ color: 'var(--mute)' }}>
                  {activeEmp.dept} · EMP-{activeEmp.emp_id} · {activeEmp.email}
                </small>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  className="pill"
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    padding: '6px 14px',
                    background: isPassingBenchmark
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                    color: isPassingBenchmark ? '#10b981' : '#ef4444',
                    border: `1px solid ${
                      isPassingBenchmark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                    }`
                  }}
                >
                  Score: {overallScore}%
                </span>
                <small
                  style={{
                    display: 'block',
                    marginTop: '3px',
                    color: 'var(--mute)',
                    fontSize: '10.5px'
                  }}
                >
                  {isPassingBenchmark ? '✓ Meets 80% Target' : '⚠ Below 80% Target'}
                </small>
              </div>
            </div>

            <div className="range">
              <span>Quality &amp; Delivery</span>
              <input
                type="range"
                min="0"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
              <b>{quality}%</b>
            </div>

            <div className="range">
              <span>Sprint Velocity &amp; Timeliness</span>
              <input
                type="range"
                min="0"
                max="100"
                value={timeliness}
                onChange={(e) => setTimeliness(Number(e.target.value))}
              />
              <b>{timeliness}%</b>
            </div>

            <div className="range">
              <span>Collaboration &amp; Teamwork</span>
              <input
                type="range"
                min="0"
                max="100"
                value={collaboration}
                onChange={(e) => setCollaboration(Number(e.target.value))}
              />
              <b>{collaboration}%</b>
            </div>

            <label style={{ marginTop: '16px', display: 'block', fontWeight: 600 }}>
              Performance Review Comments &amp; Coaching Feedback
            </label>
            <textarea
              rows="4"
              placeholder={`Write feedback for ${activeEmp.first_name || activeEmp.name} (this will appear on their employee portal)...`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', marginTop: '6px' }}
            />

            <div className="row" style={{ marginTop: '18px', gap: '10px' }}>
              <button
                type="button"
                className="btn"
                onClick={handleSaveEvaluation}
                disabled={isSaving}
              >
                {isSaving ? 'Saving to MySQL...' : 'Save evaluation'}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={handleGenerateReport}
              >
                Download report
              </button>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--mute)' }}>Select an employee from the roster to edit performance.</p>
        )}
      </div>
    </div>
  );
};
