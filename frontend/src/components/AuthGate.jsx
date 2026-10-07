import React, { useState } from 'react';
import { Icon } from '../icons';

export const AuthGate = ({ onLogin, onSignup, employees, showToast }) => {
  const [role, setRole] = useState('employee');
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup' | 'forgot'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    hireDate: '',
    empId: '',
    dept: 'Engineering',
    city: '',
    password: ''
  });

  // Forgot password form state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setLoginPassword('');
    if (newRole === 'admin') {
      setLoginEmail('hr@company.com');
    } else {
      setLoginEmail('');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword;

    if (!email) {
      showToast('Please enter your work email');
      return;
    }
    if (!password) {
      showToast('Please enter your password');
      return;
    }

    if (role === 'admin') {
      const validAdminEmails = ['hr@company.com', 'admin@company.com', 'admin@workforce.com'];
      const isAdminEmail = validAdminEmails.includes(email) || email.startsWith('hr@') || email.startsWith('admin@');

      if (!isAdminEmail) {
        showToast('Invalid admin email. Use hr@company.com');
        return;
      }
      
      // Check stored custom admin password or default 'admin123'
      let storedPasswords = {};
      try {
        storedPasswords = JSON.parse(localStorage.getItem('wf_passwords') || '{}');
      } catch (err) {}
      const customAdminPass = storedPasswords[email];

      const isMatch = customAdminPass ? password === customAdminPass : (password === 'admin123' || password === 'admin');

      if (!isMatch) {
        showToast('Incorrect admin password! (Hint: admin123)');
        return;
      }
      onLogin({ role: 'admin', user: { name: 'HR Administrator', role: 'admin' } });
    } else {
      // Role: employee
      const matched = employees.find(
        (emp) => (emp.email && emp.email.toLowerCase() === email) || emp.name.toLowerCase() === email
      );

      if (!matched) {
        showToast('No employee account found for: ' + email);
        return;
      }

      // Check against stored registered password or default password123
      let storedPasswords = {};
      try {
        storedPasswords = JSON.parse(localStorage.getItem('wf_passwords') || '{}');
      } catch (err) {}

      const registeredPass = storedPasswords[email];
      const isMatch = registeredPass
        ? password === registeredPass
        : (password === 'password123' || password === 'password' || password === 'emp123' || password === String(matched.emp_id));

      if (!isMatch) {
        showToast('Incorrect password! Please try again or use Forgot Password.');
        return;
      }

      onLogin({ role: 'employee', user: matched });
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupForm.firstName.trim() || !signupForm.email.trim()) {
      showToast('Please fill in First Name and Work Email');
      return;
    }
    if (!signupForm.password.trim()) {
      showToast('Please create an initial password');
      return;
    }

    const success = await onSignup(signupForm);
    if (success) {
      setLoginEmail(signupForm.email.trim());
      setLoginPassword('');
      setAuthView('login');
      setRole('employee');
    }
  };

  const handleSendResetCode = () => {
    const email = resetEmail.trim().toLowerCase();
    if (!email) {
      showToast('Please enter your work email first');
      return;
    }

    if (role === 'admin') {
      const validAdminEmails = ['hr@company.com', 'admin@company.com', 'admin@workforce.com'];
      if (!validAdminEmails.includes(email) && !email.startsWith('hr@') && !email.startsWith('admin@')) {
        showToast('Admin account not found for this email');
        return;
      }
    } else {
      const matched = employees.find(
        (emp) => (emp.email && emp.email.toLowerCase() === email) || emp.name.toLowerCase() === email
      );
      if (!matched) {
        showToast('No employee registered with email: ' + email);
        return;
      }
    }

    setCodeSent(true);
    setResetCode('123456');
    showToast('Verification code sent! (Demo code: 123456)');
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    const email = resetEmail.trim().toLowerCase();

    if (!email) {
      showToast('Please enter your work email');
      return;
    }

    if (!resetCode.trim()) {
      showToast('Please enter the verification code');
      return;
    }

    if (newPass.length < 4) {
      showToast('Password must be at least 4 characters');
      return;
    }

    if (newPass !== confirmPass) {
      showToast('New passwords do not match');
      return;
    }

    // Verify employee or admin exists
    if (role === 'employee') {
      const matched = employees.find(
        (emp) => (emp.email && emp.email.toLowerCase() === email) || emp.name.toLowerCase() === email
      );
      if (!matched) {
        showToast('No employee found with this email: ' + email);
        return;
      }
    }

    // Save newly reset password in persistent store
    try {
      const stored = JSON.parse(localStorage.getItem('wf_passwords') || '{}');
      stored[email] = newPass;
      localStorage.setItem('wf_passwords', JSON.stringify(stored));
    } catch (err) {}

    showToast('Password reset successfully! Please sign in with your new password.');
    setLoginEmail(email);
    setLoginPassword('');
    setResetEmail('');
    setResetCode('');
    setNewPass('');
    setConfirmPass('');
    setCodeSent(false);
    setAuthView('login');
  };

  return (
    <section className="gate">
      {/* Brand Hero Panel */}
      <div className="brand">
        <div style={{ fontWeight: 700, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="portal" size={24} />
          Workforce Portal
        </div>
        <div>
          <h1>One place for the work, the people and the hours.</h1>
          <p>
            Employees track tasks, attendance and performance. HR assigns work, evaluates outcomes, and monitors real-time staff status across the organization.
          </p>
          <div className="split">
            <div>
              <b>Employee portal</b>Tasks, attendance, document hub
            </div>
            <div>
              <b>Admin / HR portal</b>Assign, evaluate, live monitoring
            </div>
          </div>
        </div>
        <small style={{ opacity: 0.85, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="dot" style={{ background: '#4ade80' }}></span> Connected to Node.js &amp; MySQL Backend
        </small>
      </div>

      {/* Form Card */}
      <div className="formwrap">
        <div className="card login">
          {/* 1. LOGIN VIEW */}
          {authView === 'login' && (
            <div>
              <h2>Sign in</h2>
              <p className="sub">Choose your portal role to continue.</p>

              <div className="tabs" role="tablist">
                <button
                  type="button"
                  className={role === 'employee' ? 'on' : ''}
                  onClick={() => handleRoleChange('employee')}
                >
                  Employee login
                </button>
                <button
                  type="button"
                  className={role === 'admin' ? 'on' : ''}
                  onClick={() => handleRoleChange('admin')}
                >
                  Admin login
                </button>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <label htmlFor="em">Work email</label>
                <input
                  id="em"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '14px 0 6px' }}>
                  <label htmlFor="pw" style={{ margin: 0 }}>Password</label>
                  <button
                    type="button"
                    className="link"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                    onClick={() => {
                      setResetEmail(loginEmail);
                      setAuthView('forgot');
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  id="pw"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />

                <button type="submit" className="btn full">
                  Sign in as {role}
                </button>
              </form>

              <p className="sub" style={{ margin: '14px 0 0', textAlign: 'center', fontSize: '12px' }}>
                {role === 'admin' ? (
                  <span>Admin login: <b>hr@company.com</b> &nbsp;|&nbsp; Password: <b>admin123</b></span>
                ) : (
                  <span>Employee login: use your password or default <b>password123</b></span>
                )}
              </p>

              {role === 'employee' && (
                <p className="sub" style={{ margin: '16px 0 0', textAlign: 'center' }}>
                  New here?{' '}
                  <button type="button" className="link" onClick={() => setAuthView('signup')}>
                    Create employee account
                  </button>
                </p>
              )}
            </div>
          )}

          {/* 2. SIGNUP VIEW */}
          {authView === 'signup' && (
            <div>
              <h2>Create account</h2>
              <p className="sub">Employee onboarding registration</p>

              <form onSubmit={handleSignupSubmit}>
                <div className="fields">
                  <div>
                    <label>First name *</label>
                    <input
                      placeholder="Enter first name"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label>Last name</label>
                    <input
                      placeholder="Enter last name"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <label>Work email *</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                />

                <div className="fields">
                  <div>
                    <label>Hire date</label>
                    <input
                      type="date"
                      value={signupForm.hireDate}
                      onChange={(e) => setSignupForm({ ...signupForm, hireDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Employee ID (optional)</label>
                    <input
                      type="number"
                      placeholder="Auto-generated"
                      value={signupForm.empId}
                      onChange={(e) => setSignupForm({ ...signupForm, empId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="fields">
                  <div>
                    <label>Department</label>
                    <select
                      value={signupForm.dept}
                      onChange={(e) => setSignupForm({ ...signupForm, dept: e.target.value })}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="HR">HR</option>
                      <option value="sales">Sales</option>
                      <option value="support">Support</option>
                      <option value="development">Development</option>
                    </select>
                  </div>
                  <div>
                    <label>City / Location</label>
                    <input
                      placeholder="Enter city / location"
                      value={signupForm.city}
                      onChange={(e) => setSignupForm({ ...signupForm, city: e.target.value })}
                    />
                  </div>
                </div>

                <label>Initial password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  required
                />

                <button type="submit" className="btn full">
                  Create account
                </button>
              </form>

              <p className="sub" style={{ margin: '18px 0 0', textAlign: 'center' }}>
                <button type="button" className="link" onClick={() => setAuthView('login')}>
                  Back to sign in
                </button>
              </p>
            </div>
          )}

          {/* 3. FORGOT PASSWORD VIEW */}
          {authView === 'forgot' && (
            <div>
              <h2>Reset password</h2>
              <p className="sub">
                Enter your work email and verify your identity to reset your password.
              </p>

              <form onSubmit={handleResetSubmit}>
                <label htmlFor="resetEmail">Work email *</label>
                <input
                  id="resetEmail"
                  type="email"
                  placeholder="name@company.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  autoFocus
                />

                <label htmlFor="resetCode">Security Verification</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="resetCode"
                    placeholder="Enter code or Emp ID"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn ghost"
                    style={{ whiteSpace: 'nowrap', padding: '0 14px', fontSize: '12px' }}
                    onClick={handleSendResetCode}
                  >
                    {codeSent ? 'Resend' : 'Send code'}
                  </button>
                </div>

                <div className="fields">
                  <div>
                    <label htmlFor="newPass">New password *</label>
                    <input
                      id="newPass"
                      type="password"
                      placeholder="Min 4 characters"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPass">Confirm password *</label>
                    <input
                      id="confirmPass"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn full">
                  Reset &amp; Save password
                </button>
              </form>

              <p className="sub" style={{ margin: '18px 0 0', textAlign: 'center' }}>
                <button type="button" className="link" onClick={() => setAuthView('login')}>
                  Back to sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
