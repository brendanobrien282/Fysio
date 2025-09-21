import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthFormProps {
  onSwitchMode: () => void;
  isLogin: boolean;
  onSignupSuccess: () => void;
}

function AuthForm({ onSwitchMode, isLogin, onSignupSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ptName, setPtName] = useState('');
  const [ptEmail, setPtEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { signIn, signUp, error: authError, loading: authLoading } = useAuth();

  // Debug logging for state changes
  console.log('AuthForm render - authLoading:', authLoading);

  // Load saved credentials on component mount
  useEffect(() => {
    try {
      const savedCredentials = localStorage.getItem('fysio_remembered_user');
      if (savedCredentials) {
        const { email: savedEmail, rememberMe: wasRemembered } = JSON.parse(savedCredentials);
        if (wasRemembered) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      }
    } catch (error) {
      console.warn('Failed to load saved credentials:', error);
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    setLocalError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        
        // Save credentials if "Remember Me" is checked
        if (rememberMe) {
          try {
            localStorage.setItem('fysio_remembered_user', JSON.stringify({
              email,
              rememberMe: true
            }));
          } catch (error) {
            console.warn('Failed to save credentials:', error);
          }
        } else {
          // Clear saved credentials if "Remember Me" is unchecked
          try {
            localStorage.removeItem('fysio_remembered_user');
          } catch (error) {
            console.warn('Failed to clear credentials:', error);
          }
        }
      } else {
        // Validate all fields for registration
        const emailTrimmed = email.trim();
        const nameTrimmed = name.trim();
        const ptNameTrimmed = ptName.trim();
        const ptEmailTrimmed = ptEmail.trim();
        
        console.log('Starting signup process...');
        
        if (!emailTrimmed) {
          setLocalError('Email is required');
          return;
        }
        
        if (!password) {
          setLocalError('Password is required');
          return;
        }
        
        if (!nameTrimmed) {
          setLocalError('Name is required');
          return;
        }
        
        if (!ptNameTrimmed) {
          setLocalError('Physical Therapist name is required');
          return;
        }
        
        if (!ptEmailTrimmed) {
          setLocalError('Physical Therapist email is required');
          return;
        }
        
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters');
          return;
        }
        
        console.log('All validation passed, calling signUp...');
        
        await signUp(emailTrimmed, password, {
          name: nameTrimmed,
          pt_name: ptNameTrimmed,
          pt_email: ptEmailTrimmed
        });
        
        console.log('SignUp completed successfully, calling onSignupSuccess...');
        
        // Clear form fields and call parent callback
        setEmail('');
        setPassword('');
        setName('');
        setPtName('');
        setPtEmail('');
        setLocalError('');
        setSuccessMessage('');
        
        // Call parent callback to show confirmation screen
        onSignupSuccess();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      if (err.message.includes('Email not confirmed')) {
        setLocalError('Please check your email and click the confirmation link before signing in.');
      } else if (err.message.includes('Invalid login credentials')) {
        setLocalError('Invalid email or password. Please check your credentials.');
      } else if (err.message.includes('fetch')) {
        setLocalError('🔥 Connection Error: Please check your Supabase setup! Open browser console for details.');
      } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        setLocalError('🔥 Network Error: Cannot connect to Supabase. Check your .env.local file and Supabase credentials.');
      } else if (err.message.includes('Email address') && err.message.includes('invalid')) {
        setLocalError('❌ Email address is invalid. Try using a different email address or contact your administrator.');
      } else if (err.message.includes('User already registered')) {
        setLocalError('⚠️ An account with this email already exists. Try signing in instead or use a different email.');
      } else {
        setLocalError('An error occurred: ' + err.message);
      }
    } finally {
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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Exercise Silhouettes Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.25,
        pointerEvents: 'none'
      }}>
        {/* Weightlifter - top left */}
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '12%',
          fontSize: '6rem',
          color: '#4c1d95',
          transform: 'rotate(-10deg)',
          fontFamily: 'Arial, sans-serif'
        }}>⛹</div>
        
        {/* Runner - middle left */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '5%',
          fontSize: '5.5rem',
          color: '#4c1d95',
          transform: 'rotate(-8deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🏃</div>
        
        {/* Cyclist - bottom right */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          fontSize: '6rem',
          color: '#4c1d95',
          transform: 'rotate(12deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🚴</div>
        
        {/* Swimmer - top right */}
        <div style={{
          position: 'absolute',
          top: '12%',
          right: '15%',
          fontSize: '5rem',
          color: '#4c1d95',
          transform: 'rotate(15deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🏊</div>
      </div>
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
            color: '#1a202c',
            fontSize: '3rem',
            fontWeight: '800',
            margin: '0 0 10px 0',
            fontFamily: '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '-0.01em',
            lineHeight: '0.9',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            FYSIO
          </h1>
          <p style={{ color: '#718096', margin: 0 }}>
            Your personal exercise tracker!
          </p>
          {(isLogin || !isLogin) && (
            <p style={{ color: '#4a5568', margin: '10px 0 0 0', fontSize: '0.9rem', fontWeight: '600' }}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </p>
          )}
        </div>

        {/* Info for Supabase setup */}
        {isLogin && (
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '0.85rem'
          }}>
            <strong>📧 Email Confirmation:</strong><br />
            Supabase requires email confirmation by default. After signing up:
            <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>Check your email for confirmation link</li>
              <li>Click the link to confirm</li>
              <li>Then you can sign in here</li>
            </ol>
            <em>For development, you can disable this in Supabase Settings → Authentication!</em>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          {isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ 
                    marginRight: '8px', 
                    transform: 'scale(1.1)',
                    accentColor: '#667eea'
                  }}
                />
                <span style={{ fontWeight: '500' }}>
                  🔒 Remember my email for next time
                </span>
              </label>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                marginTop: '4px',
                marginLeft: '24px'
              }}>
                Your email will be saved locally for convenience
              </div>
            </div>
          )}

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

          {successMessage && (
            <div style={{
              color: '#065f46',
              backgroundColor: '#ecfdf5',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '0.95rem',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(16, 185, 129, 0.1)'
            }}>
              <div style={{ marginBottom: '8px', fontSize: '1.1rem' }}>
                {successMessage}
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                color: '#047857',
                fontStyle: 'italic',
                marginTop: '8px'
              }}>
                💡 Note: If the confirmation link doesn't work, don't worry! Contact your administrator to activate your account manually.
              </div>
            </div>
          )}

          {(localError || authError) && (
            <div style={{
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '8px 12px',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              {localError || authError}
            </div>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit()}
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
                (e.target as HTMLButtonElement).style.backgroundColor = '#5a67d8';
              }
            }}
            onMouseOut={(e) => {
              if (!isSubmitting) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#667eea';
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

export default AuthForm;

