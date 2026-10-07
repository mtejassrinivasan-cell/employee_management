import React, { useState } from 'react';

export const ProfileSettings = ({ user, onUpdateProfile, showToast }) => {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || '');
  
  const [contactName, setContactName] = useState('Suresh Raman');
  const [contactPhone, setContactPhone] = useState('+91 98401 23456');
  const [accountHolder, setAccountHolder] = useState(user?.name || 'Tejas M');
  
  const [skills, setSkills] = useState([
    'SQL',
    'REST APIs',
    'Node.js',
    'Express',
    'Database Design'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && newSkillInput.trim()) {
      e.preventDefault();
      const trimmed = newSkillInput.trim();
      if (!skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
      }
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await onUpdateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      E_mail_id: email.trim(),
      city: city.trim()
    });
    showToast('Profile changes saved successfully');
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'grid', gap: '20px' }}>
      <div className="card pad">
        <h3>Personal Details</h3>
        <div className="fields">
          <div>
            <label>First Name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label>Last Name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div>
            <label>Work Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>City / Location</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label>Department</label>
            <input disabled value={user?.dept || 'Engineering'} />
          </div>
          <div>
            <label>Employee ID</label>
            <input disabled value={user?.id || (user?.emp_id ? `EMP-${user.emp_id}` : 'EMP-201')} />
          </div>
        </div>
      </div>

      <div className="card pad">
        <h3>Emergency Contact</h3>
        <div className="fields">
          <div>
            <label>Contact Name</label>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div>
            <label>Phone Number</label>
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </div>
          <div>
            <label>Relationship</label>
            <input defaultValue="Sibling" />
          </div>
        </div>
      </div>

      <div className="card pad">
        <h3>Bank &amp; Payroll details</h3>
        <div className="fields">
          <div>
            <label>Account Holder</label>
            <input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} />
          </div>
          <div>
            <label>Account Number</label>
            <input type="password" defaultValue="987654321012" />
          </div>
          <div>
            <label>Bank IFSC / Code</label>
            <input defaultValue="HDFC0001234" />
          </div>
        </div>
      </div>

      <div className="card pad">
        <h3>Skills &amp; Competencies</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {skills.map((skill) => (
            <span key={skill} className="chip">
              {skill}
              <button type="button" onClick={() => handleRemoveSkill(skill)}>
                ×
              </button>
            </span>
          ))}
        </div>
        <div>
          <input
            placeholder="Type a skill and press Enter"
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
          />
        </div>
      </div>

      <div>
        <button type="submit" className="btn">
          Save profile changes
        </button>
      </div>
    </form>
  );
};
