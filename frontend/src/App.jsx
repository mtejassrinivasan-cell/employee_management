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

const INITIAL_TASKS = [];

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
  const [role, setRole] = useState(() => {
    return localStorage.getItem('wf_role') || 'employee';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('wf_is_logged_in') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('wf_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [userStatus, setUserStatus] = useState(() => {
    return localStorage.getItem('wf_user_status') || 'Available';
  });
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('wf_active_page') || 'dashboard';
  });
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

  // Persist session to localStorage across browser refreshes
  useEffect(() => {
    localStorage.setItem('wf_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('wf_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wf_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wf_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('wf_user_status', userStatus);
  }, [userStatus]);

  useEffect(() => {
    localStorage.setItem('wf_active_page', activePage);
  }, [activePage]);

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

  // Fetch Employees from MySQL Backend (cache-busting enabled)
  const loadEmployees = async (notify = false) => {
    try {
      const res = await fetch(`${API_BASE}/employees/getall?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        setIsDbConnected(true);
        const mapped = json.data.map((r, i) => {
          const fullName = `${r.first_name || ''} ${r.last_name || ''}`.trim() || `Employee ${r.emp_id}`;
          const fallbackScore = [88, 84, 76, 81, 89, 90, 84, 78, 85, 91][i % 10];
          const score = r.score !== null && r.score !== undefined ? Number(r.score) : fallbackScore;
          return {
            emp_id: r.emp_id,
            id: `EMP-${r.emp_id}`,
            name: fullName,
            first_name: r.first_name || '',
            last_name: r.last_name || '',
            dept: r.dept_name || 'Engineering',
            status: r.live_status || 'Available',
            live_status: r.live_status || 'Available',
            email: r.E_mail_id || `emp${r.emp_id}@company.com`,
            city: r.city || r.location || 'Chennai',
            location: r.location || r.city || 'Chennai',
            salary: r.salary || 250000,
            experience: r.experience || 3,
            hire_date: r.hire_date ? String(r.hire_date).slice(0, 10) : '2022-01-15',
            score,
            quality: r.quality !== null && r.quality !== undefined ? Number(r.quality) : score,
            timeliness: r.timeliness !== null && r.timeliness !== undefined ? Number(r.timeliness) : Math.max(50, score - 4),
            collaboration: r.collaboration !== null && r.collaboration !== undefined ? Number(r.collaboration) : Math.min(100, score + 3),
            feedback: r.feedback || '',
            review_date: r.review_date || null
          };
        });
        setEmployees(mapped);
        if (currentUser?.emp_id) {
          const fresh = mapped.find((e) => e.emp_id === currentUser.emp_id);
          if (fresh) {
            setCurrentUser((prev) => ({ ...prev, ...fresh }));
            if (fresh.status) {
              setUserStatus(fresh.status);
            }
          }
        }
        if (notify) {
          showToast(`Refreshed ${mapped.length} employees from database`);
        }
        return true;
      }
    } catch (err) {
      console.warn('API fetch notice (fallback sample active):', err.message);
      if (notify) {
        showToast('Notice: Could not reach server');
      }
      return false;
    }
  };

  // Fetch Tasks from MySQL Backend (cache-busting enabled)
  const loadTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees/tasks?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        setTasks(json.data);
      }
    } catch (err) {
      console.warn('API tasks fetch notice:', err.message);
    }
  };

  // Fetch Documents from MySQL Backend (cache-busting enabled)
  const loadDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees/documents?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        const broadcast = json.data.filter((d) => d.doc_type === 'broadcast');
        const empUploads = json.data.filter((d) => d.doc_type === 'employee_upload');
        setDocs(broadcast);
        setUploads(empUploads);
      }
    } catch (err) {
      console.warn('API documents fetch notice:', err.message);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadTasks();
    loadDocuments();
    // Auto-sync polling every 3 seconds so Admin and Employee see live changes
    const pollInterval = setInterval(() => {
      loadEmployees();
      loadTasks();
      loadDocuments();
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [currentUser?.emp_id]);

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
    localStorage.removeItem('wf_is_logged_in');
    localStorage.removeItem('wf_current_user');
    localStorage.removeItem('wf_active_page');
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
    try {
      if (currentUser?.emp_id) {
        const patchRes = await fetch(`${API_BASE}/employees/patchemployee/${currentUser.emp_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        const patchJson = await patchRes.json().catch(() => ({}));
        if (!patchJson.success) {
          // If record does not exist in DB yet, insert as new employee
          await fetch(`${API_BASE}/employees/saveemployee`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              emp_id: currentUser.emp_id,
              ...updateData,
              dept_name: currentUser.dept || 'Engineering'
            })
          });
        }
      } else {
        await fetch(`${API_BASE}/employees/saveemployee`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updateData,
            dept_name: currentUser?.dept || 'Engineering'
          })
        });
      }
      await loadEmployees();
    } catch (e) {
      console.warn('Profile update sync notice:', e);
    }

    const updated = {
      ...currentUser,
      first_name: updateData.first_name,
      last_name: updateData.last_name,
      name: `${updateData.first_name} ${updateData.last_name || ''}`.trim(),
      email: updateData.E_mail_id,
      city: updateData.city
    };
    setCurrentUser(updated);
    setEmployees(employees.map((e) => (e.emp_id === currentUser?.emp_id ? updated : e)));
  };

  const handleSavePerformance = async (empId, perfData) => {
    try {
      const res = await fetch(`${API_BASE}/employees/performance/${empId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Performance evaluation and feedback saved to MySQL!');
        await loadEmployees();
        return true;
      }
    } catch (e) {
      console.warn('API performance save notice:', e);
    }

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.emp_id === empId
          ? {
              ...emp,
              score: perfData.score,
              quality: perfData.quality,
              timeliness: perfData.timeliness,
              collaboration: perfData.collaboration,
              feedback: perfData.feedback
            }
          : emp
      )
    );
    showToast('Performance evaluation saved in session');
    return true;
  };

  const handleUpdateStatus = async (newStatus, targetEmpId = null) => {
    const empId = targetEmpId || activeUser?.emp_id;
    setUserStatus(newStatus);
    if (!empId) return;

    // Optimistically update employee list
    setEmployees((prev) =>
      prev.map((e) => (e.emp_id === empId ? { ...e, status: newStatus, live_status: newStatus } : e))
    );

    try {
      const res = await fetch(`${API_BASE}/employees/status/${empId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data && data.success) {
        showToast(`Status updated to ${newStatus}`);
      }
      await loadEmployees();
    } catch (e) {
      console.warn('Status update API error:', e);
    }
  };

  // Task & Document Handlers
  const handleAddTask = async (newTask) => {
    try {
      const res = await fetch(`${API_BASE}/employees/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Task assigned successfully');
        await loadTasks();
        return;
      }
    } catch (e) {
      console.warn('Task save notice:', e);
    }
    setTasks([newTask, ...tasks]);
    showToast('Task added to To Do');
  };

  const handleUpdateTaskStage = async (taskId, newStage) => {
    try {
      await fetch(`${API_BASE}/employees/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      await loadTasks();
    } catch (e) {
      console.warn('Task patch notice:', e);
    }
    const colNames = ['To Do', 'In Progress', 'Under Review', 'Completed'];
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, s: newStage } : t)));
    showToast(`Task moved to ${colNames[newStage]}`);
  };

  const handleUploadFile = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/employees/documents/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast('Document uploaded successfully for HR review');
        await loadDocuments();
        return;
      }
    } catch (e) {
      console.warn('Document upload notice:', e);
    }
    showToast('Document uploaded');
    await loadDocuments();
  };

  const handleBroadcastDoc = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/employees/documents/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast('Document broadcasted to all employees');
        await loadDocuments();
        return;
      }
    } catch (e) {
      console.warn('Document broadcast notice:', e);
    }
    showToast('Document broadcasted');
    await loadDocuments();
  };

  const handleReviewDoc = async (docId, reviewData) => {
    try {
      const res = await fetch(`${API_BASE}/employees/documents/${docId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Document marked as ${reviewData.status}`);
        await loadDocuments();
        return;
      }
    } catch (e) {
      console.warn('Document review notice:', e);
    }
    showToast('Review status updated');
    await loadDocuments();
  };

  const handleDeleteDoc = async (docId) => {
    try {
      const res = await fetch(`${API_BASE}/employees/documents/${docId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('Document removed');
        await loadDocuments();
        return;
      }
    } catch (e) {
      console.warn('Document delete notice:', e);
    }
    showToast('Document removed');
    await loadDocuments();
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

  const activeUser =
    role === 'employee' && currentUser?.emp_id
      ? employees.find((e) => e.emp_id === currentUser.emp_id) || currentUser
      : currentUser;

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
          user={activeUser}
          userStatus={activeUser?.status || userStatus}
          onStatusChange={handleUpdateStatus}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          showToast={showToast}
        />

        <div className="content">
          {/* Employee Views */}
          {role === 'employee' && activePage === 'dashboard' && (
            <EmployeeDashboard user={activeUser} tasks={tasks} />
          )}
          {role === 'employee' && activePage === 'tasks' && (
            <KanbanTasks
              tasks={tasks}
              onUpdateTaskStage={handleUpdateTaskStage}
              onAddTask={handleAddTask}
              user={activeUser}
              userName={activeUser?.name}
            />
          )}
          {role === 'employee' && activePage === 'performance' && (
            <PerformanceView user={activeUser} />
          )}
          {role === 'employee' && activePage === 'attendance' && (
            <AttendanceView
              user={activeUser}
              userStatus={activeUser?.status || userStatus}
              showToast={showToast}
              onStatusChange={handleUpdateStatus}
            />
          )}
          {role === 'employee' && activePage === 'documents' && (
            <DocumentHub
              docs={docs}
              uploads={uploads}
              onUploadFile={handleUploadFile}
              onDeleteDoc={handleDeleteDoc}
              currentUser={currentUser}
              showToast={showToast}
            />
          )}
          {role === 'employee' && activePage === 'profile' && (
            <ProfileSettings
              user={activeUser}
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
              onUpdateStatus={handleUpdateStatus}
              onRefresh={loadEmployees}
              showToast={showToast}
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
            <AdminPerformanceEditor
              employees={employees}
              onSavePerformance={handleSavePerformance}
              showToast={showToast}
            />
          )}
          {role === 'admin' && activePage === 'docs' && (
            <AdminDocumentCenter
              docs={docs}
              uploads={uploads}
              onBroadcastDoc={handleBroadcastDoc}
              onReviewDoc={handleReviewDoc}
              onDeleteDoc={handleDeleteDoc}
              showToast={showToast}
            />
          )}
          {role === 'admin' && activePage === 'attend' && (
            <AdminAttendanceMonitor
              employees={employees}
              onUpdateStatus={handleUpdateStatus}
              onRefresh={loadEmployees}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
