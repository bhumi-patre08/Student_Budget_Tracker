import { useState } from 'react';
import { BrandMark, ThemeToggle } from './Brand';

function Login({ theme, onToggleTheme }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (isRegistering && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/${isRegistering ? 'register' : 'login'}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...(isRegistering && { name }),
            email,
            password,
            ...(isRegistering && { confirmPassword }),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        setErrorMessage(data.message || 'Unable to authenticate your account.');
      }
    } catch (error) {
      console.error(isRegistering ? 'Registration error:' : 'Login error:', error);
      setErrorMessage('Unable to connect to the server.');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setErrorMessage('');
  };

  return (
    <div className="login-container">
      <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
      <div className="login-box">
        <div className="login-brand">
          <BrandMark className="login-brand-mark" />
        </div>
        <h2>{isRegistering ? 'Create your account' : 'Welcome back'}</h2>
        <p className="login-intro">
          {isRegistering
            ? 'Start managing your money with confidence.'
            : 'Sign in to continue to your budget.'}
        </p>

        {errorMessage && (
          <p className="form-error" role="alert">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              placeholder={isRegistering ? 'At least 8 characters' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={isRegistering ? 8 : undefined}
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          )}

          <button type="submit">
            {isRegistering ? 'Create account' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegistering ? 'Already have an account?' : 'New here?'}
          <button type="button" onClick={toggleMode}>
            {isRegistering ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
