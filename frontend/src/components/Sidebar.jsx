import React from 'react';
import { Icon } from '../icons';

export const Sidebar = ({
  role,
  activePage,
  onNavigate,
  isThemeDark,
  onToggleTheme,
  onLogout,
  isOpen,
  onCloseMobile
}) => {
  const navItems = {
    employee: [
      { id: 'dashboard', label: 'My dashboard', icon: 'home' },
      { id: 'tasks', label: 'My tasks', icon: 'task' },
      { id: 'performance', label: 'Performance', icon: 'chart' },
      { id: 'attendance', label: 'Attendance', icon: 'cal' },
      { id: 'documents', label: 'Document hub', icon: 'doc' },
      { id: 'profile', label: 'Profile settings', icon: 'user' }
    ],
    admin: [
      { id: 'dashboard', label: 'Overview', icon: 'home' },
      { id: 'directory', label: 'Employee directory', icon: 'team' },
      { id: 'alloc', label: 'Task allocation', icon: 'task' },
      { id: 'perf', label: 'Performance editor', icon: 'chart' },
      { id: 'docs', label: 'Document center', icon: 'doc' },
      { id: 'attend', label: 'Attendance monitor', icon: 'cal' }
    ]
  };

  const currentNav = navItems[role] || navItems.employee;

  return (
    <aside className={isOpen ? 'open' : ''}>
      <div className="logo">
        <Icon name="portal" size={20} />
        <span>{role === 'admin' ? 'Workforce · HR Admin' : 'Workforce · Employee'}</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {currentNav.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav ${activePage === item.id ? 'on' : ''}`}
            onClick={() => {
              onNavigate(item.id);
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="spacer" />

      <button type="button" className="nav" onClick={onToggleTheme}>
        <Icon name="moon" size={18} />
        {isThemeDark ? 'Light mode' : 'Dark mode'}
      </button>

      <button type="button" className="nav" onClick={onLogout}>
        <Icon name="logout" size={18} />
        Sign out
      </button>
    </aside>
  );
};
