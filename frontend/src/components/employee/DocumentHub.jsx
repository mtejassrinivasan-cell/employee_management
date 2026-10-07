import React, { useRef } from 'react';
import { Icon } from '../../icons';

export const DocumentHub = ({ docs, uploads, onUploadFile, showToast }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadFile(file.name);
    showToast(`Uploaded ${file.name}`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="card pad">
        <div className="row" style={{ marginBottom: '12px' }}>
          <h3 className="grow" style={{ margin: 0 }}>
            Shared by HR
          </h3>
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Published By</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d, idx) => (
                <tr key={idx}>
                  <td><b>{d[0]}</b></td>
                  <td><span className="pill">{d[1]}</span></td>
                  <td>{d[2]}</td>
                  <td>{d[3]}</td>
                  <td>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => showToast(`Accessing ${d[0]}`)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card pad">
        <div className="row" style={{ marginBottom: '12px' }}>
          <h3 className="grow" style={{ margin: 0 }}>
            My uploaded files
          </h3>
          <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
            <Icon name="plus" size={16} /> Upload file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hide"
            onChange={handleFileChange}
          />
        </div>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>File name</th>
                <th>Submitted by</th>
                <th>Upload Date</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((u, idx) => (
                <tr key={idx}>
                  <td><b>{u[0]}</b></td>
                  <td>{u[1]}</td>
                  <td>{u[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
