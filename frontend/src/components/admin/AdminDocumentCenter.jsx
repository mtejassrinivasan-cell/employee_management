import React, { useRef } from 'react';
import { Icon } from '../../icons';

export const AdminDocumentCenter = ({ docs, uploads, onBroadcastDoc, showToast }) => {
  const fileInputRef = useRef(null);

  const handleBroadcast = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onBroadcastDoc(file.name);
    showToast(`Broadcasted ${file.name} to all employees`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="card pad">
        <div className="row" style={{ marginBottom: '14px' }}>
          <h3 className="grow" style={{ margin: 0 }}>
            Company Broadcast Documents
          </h3>
          <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
            <Icon name="plus" size={16} /> Broadcast document
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hide"
            onChange={handleBroadcast}
          />
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Published Date</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d, idx) => (
                <tr key={idx}>
                  <td><b>{d[0]}</b></td>
                  <td><span className="pill">{d[1]}</span></td>
                  <td>{d[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card pad">
        <div className="row" style={{ marginBottom: '14px' }}>
          <h3 className="grow" style={{ margin: 0 }}>
            Uploaded by Employees
          </h3>
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Employee</th>
                <th>Submission Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((u, idx) => (
                <tr key={idx}>
                  <td><b>{u[0]}</b></td>
                  <td>{u[1]}</td>
                  <td>{u[2]}</td>
                  <td>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => showToast(`Reviewing ${u[0]}`)}
                    >
                      Review file
                    </button>
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
