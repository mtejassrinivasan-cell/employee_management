import React, { useState, useEffect } from 'react';
import { AuthGate } from './components/AuthGate';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Modal';

// Employee Components
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { KanbanTasks } from './components/employee/KanbanTasks';
import { PerformanceView } from './components/employee/PerformanceView';
import { AttendanceView } from './components/employee/AttendanceView';
import { DocumentHub } from './components/employee/DocumentHub';
import { ProfileSettings } from './components/employee/ProfileSettings';

// Admin Components
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminDirectory } from './components/admin/AdminDirectory';
import { AdminTaskAllocation } from './components/admin/AdminTaskAllocation';
import { AdminPerformanceEditor } from './components/admin/AdminPerformanceEditor';
import { AdminDocumentCenter } from './components/admin/AdminDocumentCenter';
import { AdminAttendanceMonitor } from './components/admin/AdminAttendanceMonitor';

const API_BASE = ''; // Relies on Vite proxy to http://localhost:3000

// Default Fallback Employees if offline
const INITIAL_SAMPLE_EMPLOYEES = [
  ['Tejas M', 'Engineering', 'Available', 201],
  ['Priya Raman', 'Design', 'In Meeting', 202],
  ['Arun Kumar', 'Operations', 'On Leave', 203],
  ['Meera Iyer', 'Engineering', 'Available', 204],
  ['Karthik S', 'Finance', 'Out for the Day', 205],
  ['Divya N', 'Engineering', 'Available', 206],
  ['Rohan P', 'HR', 'In Meeting', 207],
  ['Sana Ali', 'Design', 'Available', 208]
].map((e, i) => ({
  emp_id: e[3],
  id: `EMP-${e[3]}`,
  name: e[0],
  first_name: e[0].split(' ')[0],
  last_name: e[0].split(' ').slice(1).join(' '),
  dept: e[1],
  status: e[2],
  email: `${e[0].toLowerCase().replace(/\s+/g, '')}@company.com`,
  city: 'Chennai',
  salary: 320000,
  experience: 4,
  score: [88, 92, 76, 81, 69, 90, 84, 78][i]
}));

const INITIAL_TASKS = [
  { id: 1, t: 'Build REST endpoints for orders', p: 'High', d: 'Oct 12', s: 0, assignee: 'Tejas M' },
  { id: 2, t: 'Write unit tests for auth', p: 'Medium', d: 'Oct 15', s: 0, assignee: 'Meera Iyer' },
  { id: 3, t: 'Fix dashboard filter bug', p: 'High', d: 'Oct 10', s: 1, assignee: 'Tejas M' },
  { id: 4, t: 'Review API docs & OpenAPI spec', p: 'Low', d: 'Oct 18', s: 2, assignee: 'Divya N' },
  { id: 5, t: 'Compile weekly sprint report', p: 'Medium', d: 'Oct 05', s: 3, assignee: 'Tejas M' },
  { id: 6, t: 'Database schema migration', p: 'High', d: 'Oct 03', s: 3, assignee: 'Arun Kumar' }
];

const INITIAL_DOCS = [
  ['Leave policy 2026.pdf', 'Policy', 'HR', 'Oct 01'],
  ['Q3 team performance brief.pdf', 'Report', 'HR', 'Sep 28'],
  ['Code of conduct & ethics.pdf', 'Policy', 'HR', 'Sep 02'],
  ['Employee handbook v3.pdf', 'Manual', 'HR', 'Aug 15']
];

const INITIAL_UPLOADS = [
  ['Weekly status report.pdf', 'Tejas M', 'Oct 04'],
  ['Architecture diagram v2.png', 'Meera Iyer', 'Oct 02']
];

export function App() {
  const [role, setRole] = useState('employee');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userStatus, setUserStatus] = useState('Available');
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Theme state
  const [isThemeDark, setIsThemeDark] = useState(() => {
    const saved = localStorage.getItem('workforce_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Data states
  const [employees, setEmployees] = useState(INITIAL_SAMPLE_EMPLOYEES);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [uploads, setUploads] = useState(INITIAL_UPLOADS);
  const [toastMessage, setToastMessage] = useState('');

  // Toast Notification Trigger
  const showToast = (msg) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(''), 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Apply Theme effect
  useEffect(() => {
    const themeName = isThemeDark ? 'dark' : 'light';
    document.documentElement.dataset.theme = themeName;
    localStorage.setItem('workforce_theme', themeName);
  }, [isThemeDark]);

  // Apply Role effect to body
  useEffect(() => {
    if (role === 'admin') {
      document.body.classList.add('admin');
    } else {
      document.body.classList.remove('admin');
    }
  }, [role]);

  // Fetch Employees from MySQL Backend
  const loadEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees/getall`);
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        setIsDbConnected(true);
        const mapped = json.data.map((r, i) => {
          const fullName = `${r.first_name || ''} ${r.last_name || ''}`.trim() || `Employee ${r.emp_id}`;
          return {
            emp_id: r.emp_id,
            id: `EMP-${r.emp_id}`,
            name: fullName,
            first_name: r.first_name || '',
            last_name: r.last_name || '',
            dept: r.dept_name || 'Engineering',
            status: i % 4 === 0 ? 'Available' : i % 4 === 1 ? 'In Meeting' : i % 4 === 2 ? 'Available' : 'On Leave',
            email: r.E_mail_id || `emp${r.emp_id}@company.com`,
            city: r.city || r.location || 'Chennai',
            location: r.location || r.city || 'Chennai',
            salary: r.salary || 250000,
            experience: r.experience || 3,
            hire_date: r.hire_date ? String(r.hire_date).slice(0, 10) : '2022-01-15',
            score: [88, 92, 76, 81, 69, 90, 84, 78, 85, 91][i % 10]
          };
        });
        setEmployees(mapped);
      }
    } catch (err) {
      console.warn('API fetch notice (fallback sample active):', err.message);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Auth Handlers
  const handleLogin = ({ role: selectedRole, user }) => {
    setRole(selectedRole);
    setCurrentUser(user);
    setIsLoggedIn(true);
    setActivePage('dashboard');
    showToast(selectedRole === 'admin' ? 'Welcome back, HR Administrator' : `Signed in as ${user.name}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    showToast('Signed out');
  };

  const handleSignup = async (formData) => {
    const payload = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      E_mail_id: formData.email.trim(),
      dept_name: formData.dept,
      city: formData.city.trim() || 'Chennai',
      location: formData.city.trim() || 'Chennai',
      hire_date: formData.hireDate || new Date().toISOString().slice(0, 10),
      salary: 280000,
      experience: 2,
      deptid: 1021,
      reports: 101
    };
    if (formData.empId) payload.emp_id = Number(formData.empId);

    try {
      const res = await fetch(`${API_BASE}/employees/saveemployee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        // Store password in localStorage
        const stored = JSON.parse(localStorage.getItem('wf_passwords') || '{}');
        stored[formData.email.trim().toLowerCase()] = formData.password.trim();
        localStorage.setItem('wf_passwords', JSON.stringify(stored));

        showToast('Account created in MySQL database! Sign in now.');
        await loadEmployees();
        return true;
      } else {
        showToast('Error: ' + (data.message || 'Could not save employee'));
        return false;
      }
    } catch (err) {
      // Offline fallback
      const newId = formData.empId ? Number(formData.empId) : employees.length ? Math.max(...employees.map(e => e.emp_id)) + 1 : 101;
      const newEmp = {
        emp_id: newId,
        id: `EMP-${newId}`,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        first_name: formData.firstName,
        last_name: formData.lastName,
        dept: formData.dept,
        status: 'Available',
        email: formData.email.trim(),
        city: formData.city.trim() || 'Chennai',
        salary: 280000,
        experience: 2,
        score: 85
      };
      setEmployees([newEmp, ...employees]);
      const stored = JSON.parse(localStorage.getItem('wf_passwords') || '{}');
      stored[formData.email.trim().toLowerCase()] = formData.password.trim();
      localStorage.setItem('wf_passwords', JSON.stringify(stored));

      showToast('Account created in session. Sign in now.');
      return true;
    }
  };

  // Admin Actions
  const handleAddEmployee = async (empData) => {
    try {
      const res = await fetch(`${API_BASE}/employees/saveemployee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Employee added to MySQL database!');
        await loadEmployees();
        return;
      }
    } catch (e) {
      console.warn('API error, saving locally:', e);
    }

    // Local fallback
    const newId = employees.length ? Math.max(...employees.map(e => e.emp_id)) + 1 : 101;
    const newEmp = {
      emp_id: newId,
      id: `EMP-${newId}`,
      name: `${empData.first_name} ${empData.last_name || ''}`.trim(),
      first_name: empData.first_name,
      last_name: empData.last_name || '',
      dept: empData.dept_name || 'Engineering',
      status: 'Available',
      email: empData.E_mail_id,
      city: empData.city || 'Chennai',
      salary: empData.salary || 0,
      experience: empData.experience || 0,
      score: 85
    };
    setEmployees([newEmp, ...employees]);
    showToast('Employee added to roster');
  };

  const handleEditEmployee = async (empId, updateData) => {
    try {
      const res = await fetch(`${API_BASE}/employees/updateemployee/${empId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Employee updated in database!');
        await loadEmployees();
        return;
      }
    } catch (e) {
      console.warn('API update error:', e);
    }

    // Local state update
    setEmployees(
      employees.map((e) =>
        e.emp_id === empId
          ? {
              ...e,
              first_name: updateData.first_name,
              last_name: updateData.last_name,
              name: `${updateData.first_name} ${updateData.last_name || ''}`.trim(),
              email: updateData.E_mail_id,
              dept: updateData.dept_name,
              city: updateData.city,
              salary: updateData.salary,
              experience: updateData.experience
            }
          : e
      )
    );
    showToast('Employee updated in session');
  };

  const handleDeleteEmployee = async (empId) => {
    try {
      const res = await fetch(`${API_BASE}/employees/deleteemployee/${empId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Employee deleted from MySQL database');
        await loadEmployees();
        return;
      }
    } catch (e) {
      console.warn('API delete error:', e);
    }

    setEmployees(employees.filter((e) => e.emp_id !== empId));
    showToast('Employee deleted');
  };

  const handleUpdateProfile = async (updateData) => {
    if (!currentUser?.emp_id) return;
    try {
      await fetch(`${API_BASE}/employees/patchemployee/${currentUser.emp_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
    } catch (e) {}

    const updated = {
      ...currentUser,
      first_name: updateData.first_name,
      last_name: updateData.last_name,
      name: `${updateData.first_name} ${updateData.last_name || ''}`.trim(),
      email: updateData.E_mail_id,
      city: updateData.city
    };
    setCurrentUser(updated);
    setEmployees(employees.map((e) => (e.emp_id === currentUser.emp_id ? updated : e)));
  };

  // Task & Document Handlers
  const handleAddTask = (newTask) => {
    setTasks([newTask, ...tasks]);
    showToast('Task added to To Do');
  };

  const handleUpdateTaskStage = (taskId, newStage) => {
    const colNames = ['To Do', 'In Progress', 'Under Review', 'Completed'];
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, s: newStage } : t)));
    showToast(`Task moved to ${colNames[newStage]}`);
  };

  const handleUploadFile = (fileName) => {
    setUploads([[fileName, currentUser?.name || 'Me', 'Oct 07'], ...uploads]);
  };

  const handleBroadcastDoc = (fileName) => {
    setDocs([[fileName, 'Policy', 'HR', 'Oct 07'], ...docs]);
  };

  const pageTitles = {
    dashboard: role === 'admin' ? 'Overview' : 'My dashboard',
    tasks: 'My tasks',
    performance: 'Performance',
    attendance: 'Attendance',
    documents: 'Document hub',
    profile: 'Profile settings',
    directory: 'Employee directory',
    alloc: 'Task allocation',
    perf: 'Performance editor',
    docs: 'Document center',
    attend: 'Attendance monitor'
  };

  if (!isLoggedIn) {
    return (
      <>
        <AuthGate
          onLogin={handleLogin}
          onSignup={handleSignup}
          employees={employees}
          showToast={showToast}
        />
        <Toast message={toastMessage} />
      </>
    );
  }

  return (
    <div className="shell">
      <Sidebar
        role={role}
        activePage={activePage}
        onNavigate={setActivePage}
        isThemeDark={isThemeDark}
        onToggleTheme={() => setIsThemeDark(!isThemeDark)}
        onLogout={handleLogout}
        isOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <main>
        <Header
          role={role}
          title={pageTitles[activePage] || 'Overview'}
          user={currentUser}
          userStatus={userStatus}
          onStatusChange={setUserStatus}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          showToast={showToast}
        />

        <div className="content">
          {/* Employee Views */}
          {role === 'employee' && activePage === 'dashboard' && (
            <EmployeeDashboard user={currentUser} tasks={tasks} />
          )}
          {role === 'employee' && activePage === 'tasks' && (
            <KanbanTasks
              tasks={tasks}
              onUpdateTaskStage={handleUpdateTaskStage}
              onAddTask={handleAddTask}
              userName={currentUser?.name}
            />
          )}
          {role === 'employee' && activePage === 'performance' && (
            <PerformanceView user={currentUser} />
          )}
          {role === 'employee' && activePage === 'attendance' && (
            <AttendanceView showToast={showToast} onStatusChange={setUserStatus} />
          )}
          {role === 'employee' && activePage === 'documents' && (
            <DocumentHub
              docs={docs}
              uploads={uploads}
              onUploadFile={handleUploadFile}
              showToast={showToast}
            />
          )}
          {role === 'employee' && activePage === 'profile' && (
            <ProfileSettings
              user={currentUser}
              onUpdateProfile={handleUpdateProfile}
              showToast={showToast}
            />
          )}

          {/* Admin Views */}
          {role === 'admin' && activePage === 'dashboard' && (
            <AdminOverview
              employees={employees}
              tasks={tasks}
              isDbConnected={isDbConnected}
            />
          )}
          {role === 'admin' && activePage === 'directory' && (
            <AdminDirectory
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}
          {role === 'admin' && activePage === 'alloc' && (
            <AdminTaskAllocation
              tasks={tasks}
              employees={employees}
              onAssignTask={handleAddTask}
            />
          )}
          {role === 'admin' && activePage === 'perf' && (
            <AdminPerformanceEditor employees={employees} showToast={showToast} />
          )}
          {role === 'admin' && activePage === 'docs' && (
            <AdminDocumentCenter
              docs={docs}
              uploads={uploads}
              onBroadcastDoc={handleBroadcastDoc}
              showToast={showToast}
            />
          )}
          {role === 'admin' && activePage === 'attend' && (
            <AdminAttendanceMonitor employees={employees} />
          )}
        </div>
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
