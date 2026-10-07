import React from 'react';

export const Toast = ({ message }) => {
  if (!message) return null;
  return (
    <div className="toast">
      <span className="dot" style={{ background: 'var(--p2)' }}></span>
      {message}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal"
      onClick={(e) => {
        if (e.target.classList.contains('modal')) onClose();
      }}
    >
      <div className="card">
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
};
