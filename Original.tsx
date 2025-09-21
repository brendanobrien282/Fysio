import React, { useState, useEffect } from 'react';

// Mock user data - in a real app, this would come from a database
const mockUsers = [
  { 
    id: 1, 
    email: 'john@example.com', 
    password: 'password123', 
    name: 'John Smith',
    ptName: 'Dr. Sarah Johnson',
    ptEmail: 'sarah.johnson@ptclinic.com'
  },
  { 
    id: 2, 
    email: 'jane@example.com', 
    password: 'password456', 
    name: 'Jane Doe',
    ptName: 'Dr. Mike Wilson',
    ptEmail: 'mike.wilson@ptclinic.com'
  }
];

// Authentication component
function AuthForm({ onLogin, onSwitchMode, isLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ptName, setPtName] = useState('');
  const [ptEmail, setPtEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    console.log('=== BUTTON CLICKED ===');
    console.log('isLogin:', isLogin);
    console.log('Form values:', { email, password, name, ptName, ptEmail });
    
    // Add a simple alert to test if the function is being called at all
    alert('Button clicked! Check console for details.');
    
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        console.log('Attempting login...');
        const user = mockUsers.find(u => u.email === email && u.password === password);
        console.log('Found user:', user);
        if (user) {
          console.log('Login successful, calling onLogin');
          onLogin(user);
        } else {
          console.log('Login failed');
          setError('Invalid email or password');
        }
      } else {
        console.log('Attempting signup...');
        
        // Check each field individually
        const emailTrimmed = email.trim();
        const nameTrimmed = name.trim();
        const ptNameTrimmed = ptName.trim();
        const ptEmailTrimmed = ptEmail.trim();
        
        console.log('Trimmed values:', {
          email: emailTrimmed,
          name: nameTrimmed,
          ptName: ptNameTrimmed,
          ptEmail: ptEmailTrimmed,
          passwordLength: password.length
        });
        
        if (!emailTrimmed) {
          console.log('Email is empty');
          setError('Email is required');
          return;
        }
        
        if (!password) {
          console.log('Password is empty');
          setError('Password is required');
          return;
        }
        
        if (!nameTrimmed) {
          console.log('Name is empty');
          setError('Name is required');
          return;
        }
        
        if (!ptNameTrimmed) {
          console.log('PT Name is empty');
          setError('Physical Therapist name is required');
          return;
        }
        
        if (!ptEmailTrimmed) {
          console.log('PT Email is empty');
          setError('Physical Therapist email is required');
          return;
        }
        
        if (password.length < 6) {
          console.log('Password too short');
          setError('Password must be at least 6 characters');
          return;
        }
        
        const existingUser = mockUsers.find(u => u.email === emailTrimmed);
        console.log('Checking for existing user:', existingUser);
        if (existingUser) {
          console.log('Email already exists');
          setError('Email already exists');
          return;
        }
        
        const newUser = {
          id: mockUsers.length + 1,
          email: emailTrimmed,
          password,
          name: nameTrimmed,
          ptName: ptNameTrimmed,
          ptEmail: ptEmailTrimmed
        };
        
        console.log('Creating new user:', newUser);
        console.log('Current mockUsers before push:', mockUsers);
        mockUsers.push(newUser);
        console.log('Current mockUsers after push:', mockUsers);
        
        console.log('Calling onLogin with new user');
        onLogin(newUser);
      }
    } catch (err) {
      console.error('Error during form submission:', err);
      setError('An error occurred: ' + err.message);
    } finally {
      console.log('=== FORM SUBMIT END ===');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            color: '#2d3748',
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0 0 10px 0'
          }}>
            PT Exercise Tracker
          </h1>
          <p style={{ color: '#718096', margin: 0 }}>
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        {/* Demo credentials */}
        {isLogin && (
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '0.85rem'
          }}>
            <strong>Demo credentials:</strong><br />
            Email: john@example.com<br />
            Password: password123<br />
            <em>Or try: jane@example.com / password456</em>
            <br />
            <button 
              type="button"
              onClick={() => {
                setEmail('john@example.com');
                setPassword('password123');
              }}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Auto-fill John's credentials
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '0.8rem' }}>
            <strong>Debug Info:</strong><br />
            Mode: {isLogin ? 'Login' : 'Signup'}<br />
            Email: "{email}" ({email.length} chars)<br />
            Password: "{password}" ({password.length} chars)<br />
            {!isLogin && (
              <>
                Name: "{name}" ({name.length} chars)<br />
                PT Name: "{ptName}" ({ptName.length} chars)<br />
                PT Email: "{ptEmail}" ({ptEmail.length} chars)<br />
              </>
            )}
          </div>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {!isLogin && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
                  Physical Therapist Name
                </label>
                <input
                  type="text"
                  value={ptName}
                  onChange={(e) => setPtName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
                  Physical Therapist Email
                </label>
                <input
                  type="email"
                  value={ptEmail}
                  onChange={(e) => setPtEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </>
          )}

          {error && (
            <div style={{
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '8px 12px',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isSubmitting ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '20px'
            }}
            onMouseOver={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = '#5a67d8';
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = '#667eea';
              }
            }}
          >
            {isSubmitting ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={onSwitchMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main PT Exercise Tracker component
function PTExerciseTracker() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [exerciseNotes, setExerciseNotes] = useState({
    'calf-raises': [],
    'ankle-circles': [],
    'hamstring-stretch': [],
    'resistance-band': []
  });
  const [expandedNotes, setExpandedNotes] = useState({});
  const [currentNotes, setCurrentNotes] = useState({
    'calf-raises': { text: '', date: new Date().toISOString().split('T')[0] },
    'ankle-circles': { text: '', date: new Date().toISOString().split('T')[0] },
    'hamstring-stretch': { text: '', date: new Date().toISOString().split('T')[0] },
    'resistance-band': { text: '', date: new Date().toISOString().split('T')[0] }
  });

  // Check for saved user session on app load - Using in-memory storage instead of localStorage
  useEffect(() => {
    // In a real app, you'd check for authentication tokens here
    // For now, we'll start with no saved session
  }, []);

  // Save data whenever it changes - Using in-memory storage
  useEffect(() => {
    // In a real app, this would sync with a backend database
    // For now, data persists only during the session
  }, [user, completedExercises, exerciseNotes]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCompletedExercises([]);
    setExerciseNotes({
      'calf-raises': [],
      'ankle-circles': [],
      'hamstring-stretch': [],
      'resistance-band': []
    });
  };

  const allExercises = ['calf-raises', 'ankle-circles', 'hamstring-stretch', 'resistance-band'];
  const completionPercentage = (completedExercises.length / allExercises.length) * 100;
  
  // Mock data for streak and adherence
  const currentStreak = 4;
  const weeklyAdherence = 85.7;
  const overallAdherence = 92.3;
  
  const getLetterGrade = (percentage) => {
    if (percentage >= 95) return { grade: 'A+', color: '#22543d' };
    if (percentage >= 90) return { grade: 'A', color: '#22543d' };
    if (percentage >= 85) return { grade: 'A-', color: '#2f855a' };
    if (percentage >= 80) return { grade: 'B+', color: '#38a169' };
    if (percentage >= 75) return { grade: 'B', color: '#48bb78' };
    if (percentage >= 70) return { grade: 'B-', color: '#68d391' };
    if (percentage >= 65) return { grade: 'C+', color: '#ed8936' };
    if (percentage >= 60) return { grade: 'C', color: '#dd6b20' };
    return { grade: 'F', color: '#e53e3e' };
  };
  
  const weeklyGrade = getLetterGrade(weeklyAdherence);
  const overallGrade = getLetterGrade(overallAdherence);

  const updateCurrentNote = (exerciseId, field, value) => {
    setCurrentNotes(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };
  
  const saveNote = (exerciseId) => {
    const note = currentNotes[exerciseId];
    if (note.text.trim()) {
      setExerciseNotes(prev => ({
        ...prev,
        [exerciseId]: [...prev[exerciseId], note]
      }));
      setCurrentNotes(prev => ({
        ...prev,
        [exerciseId]: { text: '', date: new Date().toISOString().split('T')[0] }
      }));
      setExpandedNotes(prev => ({
        ...prev,
        [exerciseId]: false
      }));
    }
  };
  
  const toggleNoteSection = (exerciseId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const generateProgressReport = () => {
    const todayDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const completedToday = completedExercises.length;
    const totalToday = allExercises.length;
    
    const reportText = `PT Progress Report - ${todayDate}

Patient: ${user.name}
Physical Therapist: ${user.ptName}

📊 Current Stats:
• Streak: ${currentStreak} days in a row with 100% completion
• This Week: ${weeklyGrade.grade} (${weeklyAdherence}%)
• Overall Grade: ${overallGrade.grade} (${overallAdherence}%)

✅ Today's Progress: ${completedToday}/${totalToday} exercises completed

Today's Exercises:
${completedExercises.includes('calf-raises') ? '✓' : '○'} Calf Raises - 3 sets of 15${exerciseNotes['calf-raises'].length > 0 ? '\n   Recent Notes: ' + exerciseNotes['calf-raises'].slice(-2).map(note => `${note.date}: ${note.text}`).join('; ') : ''}
${completedExercises.includes('ankle-circles') ? '✓' : '○'} Ankle Circles - 2 sets of 10 each direction${exerciseNotes['ankle-circles'].length > 0 ? '\n   Recent Notes: ' + exerciseNotes['ankle-circles'].slice(-2).map(note => `${note.date}: ${note.text}`).join('; ') : ''}
${completedExercises.includes('hamstring-stretch') ? '✓' : '○'} Hamstring Stretch - Hold for 30 seconds${exerciseNotes['hamstring-stretch'].length > 0 ? '\n   Recent Notes: ' + exerciseNotes['hamstring-stretch'].slice(-2).map(note => `${note.date}: ${note.text}`).join('; ') : ''}  
${completedExercises.includes('resistance-band') ? '✓' : '○'} Resistance Band Pulls - 2 sets of 12${exerciseNotes['resistance-band'].length > 0 ? '\n   Recent Notes: ' + exerciseNotes['resistance-band'].slice(-2).map(note => `${note.date}: ${note.text}`).join('; ') : ''}

Generated by PT Tracker App`;

    navigator.clipboard.writeText(reportText).then(() => {
      alert(`Progress report copied to clipboard! You can now paste it into an email to ${user.ptName} (${user.ptEmail}).`);
    }).catch(() => {
      const reportWindow = window.open('', '_blank');
      reportWindow.document.write(`
        <html>
          <head><title>PT Progress Report</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Your PT Progress Report</h2>
            <pre style="background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${reportText}</pre>
            <p><em>Copy this text and paste it into an email to your physical therapist!</em></p>
          </body>
        </html>
      `);
    });
  };

  const markComplete = (exerciseId) => {
    if (completedExercises.includes(exerciseId)) {
      setCompletedExercises(completedExercises.filter(id => id !== exerciseId));
    } else {
      setCompletedExercises([...completedExercises, exerciseId]);
    }
  };

  const ExerciseCard = ({ id, emoji, title, description, placeholder }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: completedExercises.includes(id) ? '2px solid #48bb78' : '2px solid transparent',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{emoji}</span>
            <span style={{ fontWeight: '600', color: '#2d3748', fontSize: '1.1rem' }}>
              {title}
            </span>
          </div>
          <p style={{ color: '#718096', margin: 0, fontSize: '0.95rem' }}>
            {description}
          </p>
        </div>
        <button 
          onClick={() => markComplete(id)}
          style={{
            padding: '10px 20px',
            backgroundColor: completedExercises.includes(id) ? '#48bb78' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '0.9rem'
          }}
        >
          {completedExercises.includes(id) ? '✓ Done' : 'Complete'}
        </button>
      </div>
      
      <div style={{ marginTop: '12px' }}>
        {!expandedNotes[id] ? (
          <button
            onClick={() => toggleNoteSection(id)}
            style={{
              backgroundColor: '#f7fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              color: '#4a5568',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            📝 Add Note {exerciseNotes[id].length > 0 && `(${exerciseNotes[id].length})`}
          </button>
        ) : (
          <div style={{
            backgroundColor: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <input
                type="date"
                value={currentNotes[id].date}
                onChange={(e) => updateCurrentNote(id, 'date', e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}
              />
            </div>
            <textarea
              value={currentNotes[id].text}
              onChange={(e) => updateCurrentNote(id, 'text', e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                minHeight: '50px',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                marginBottom: '8px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => saveNote(id)}
                style={{
                  backgroundColor: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
              <button
                onClick={() => toggleNoteSection(id)}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#4a5568',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
            
            {exerciseNotes[id].length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px', fontWeight: '600' }}>
                  Previous Notes:
                </div>
                {exerciseNotes[id].slice(-3).reverse().map((note, index) => (
                  <div key={index} style={{
                    fontSize: '0.75rem',
                    color: '#4b5563',
                    marginBottom: '4px',
                    padding: '4px 8px',
                    backgroundColor: 'white',
                    borderRadius: '4px'
                  }}>
                    <strong>{note.date}:</strong> {note.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Show authentication form if user is not logged in
  if (!user) {
    return (
      <AuthForm 
        onLogin={handleLogin} 
        onSwitchMode={() => setIsLogin(!isLogin)}
        isLogin={isLogin}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        
        {/* Header with user info and logout */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
              Welcome back, <strong>{user.name}</strong>
            </div>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#e53e3e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
          <h1 style={{
            color: '#2d3748',
            fontSize: '2.2rem',
            fontWeight: '700',
            margin: '0 0 10px 0'
          }}>
            Today's PT Exercises
          </h1>
          <p style={{
            color: '#718096',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Stay consistent with your physical therapy routine
          </p>
        </div>

        {/* Share Progress Button */}
        <div style={{ marginBottom: '25px', textAlign: 'center' }}>
          <button 
            onClick={generateProgressReport}
            style={{
              backgroundColor: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(72, 187, 120, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#38a169';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#48bb78';
              e.target.style.transform = 'translateY(0px)';
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>📤</span>
            Share Progress with {user.ptName}
          </button>
          <p style={{
            color: '#4a5568',
            fontSize: '0.85rem',
            marginTop: '8px',
            fontStyle: 'italic'
          }}>
            Generate a report to email {user.ptEmail}
          </p>
        </div>

        {/* Stats Dashboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '2px solid #4299e1'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🔥</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2b6cb0', marginBottom: '2px' }}>
              {currentStreak}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Day Streak
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${weeklyGrade.color}`
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📊</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: weeklyGrade.color, marginBottom: '2px' }}>
              {weeklyGrade.grade}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              This Week
            </div>
            <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '2px' }}>
              {weeklyAdherence}%
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${overallGrade.color}`
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🏆</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: overallGrade.color, marginBottom: '2px' }}>
              {overallGrade.grade}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall
            </div>
            <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '2px' }}>
              {overallAdherence}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span style={{ color: '#4a5568', fontWeight: '600' }}>
              Progress
            </span>
            <span style={{ color: '#667eea', fontWeight: '600' }}>
              {completedExercises.length} of {allExercises.length} completed
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#e2e8f0',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${completionPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #48bb78, #38a169)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Morning Routine */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            color: '#2d3748',
            fontSize: '1.4rem',
            fontWeight: '600',
            marginBottom: '15px',
            borderLeft: '4px solid #ed8936',
            paddingLeft: '12px'
          }}>
            🌅 Morning Routine
          </h3>
          
          <ExerciseCard 
            id="calf-raises"
            emoji="🏃‍♀️"
            title="Calf Raises"
            description="3 sets of 15 repetitions"
            placeholder="How did this exercise feel?"
          />
          
          <ExerciseCard 
            id="ankle-circles"
            emoji="🤸‍♀️"
            title="Ankle Circles"
            description="2 sets of 10 each direction"
            placeholder="Any stiffness or range of motion changes?"
          />
        </div>

        {/* Evening Routine */}
        <div>
          <h3 style={{
            color: '#2d3748',
            fontSize: '1.4rem',
            fontWeight: '600',
            marginBottom: '15px',
            borderLeft: '4px solid #9f7aea',
            paddingLeft: '12px'
          }}>
            🌙 Evening Routine
          </h3>
          
          <ExerciseCard 
            id="hamstring-stretch"
            emoji="🧘‍♀️"
            title="Hamstring Stretch"
            description="Hold for 30 seconds"
            placeholder="How far could you stretch? Any tightness or improvements?"
          />
          
          <ExerciseCard 
            id="resistance-band"
            emoji="💪"
            title="Resistance Band Pulls"
            description="2 sets of 12 repetitions"
            placeholder="Which resistance level? How did it feel? Any difficulty?"
          />
        </div>

        {/* Completion Message */}
        {completedExercises.length === allExercises.length && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f0fff4',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #48bb78'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎉</div>
            <h3 style={{ color: '#22543d', margin: '0 0 5px 0' }}>
              Great job, {user.name}!
            </h3>
            <p style={{ color: '#2f855a', margin: 0 }}>
              You've completed all your PT exercises for today!
            </p>
          </div>
        )}
        
      </div>
    </div>
  );
}

export default PTExerciseTracker;