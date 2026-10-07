import React, { useState } from 'react';

export const Header = ({
  role,
  title,
  user,
  userStatus,
  onStatusChange,
  onToggleMobileMenu,
  showToast
}) => {
  const [hasNotification, setHasNotification] = useState(true);

  const initials =
    role === 'admin'
      ? 'HR'
      : user?.name
      ? user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'EM';

  const handleNotificationClick = () => {
    setHasNotification(false);
    showToast(
      role === 'admin'
        ? '2 employee documents are pending approval'
        : 'New sprint task assigned: Build REST endpoints'
    );
  };

  return (
    <header className="top">
      <button
        type="button"
        className="menu"
        aria-label="Menu"
        onClick={onToggleMobileMenu}
      >
        ☰
      </button>

      <h2>{title}</h2>

      {role === 'employee' && (
        <select
          className="status"
          aria-label="Availability"
          value={userStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="Available">🟢 Available</option>
          <option value="In Meeting">🟡 In Meeting</option>
          <option value="On Leave">🔴 On Leave</option>
          <option value="Out for the Day">⚪ Out for the Day</option>
        </select>
      )}

      <button
        type="button"
        className="bell"
        aria-label="Notifications"
        title="Notifications"
        onClick={handleNotificationClick}
      >
        🔔{hasNotification && <i />}
      </button>

      <div className="av" title={user?.name || 'User'}>
        {initials}
      </div>
    </header>
  );
};
