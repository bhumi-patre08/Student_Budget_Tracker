import { useEffect, useState } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const token = localStorage.getItem('token');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === 'dark' ? '#08152e' : '#f3f7ff';
  }, [theme]);

  useEffect(() => {
    const syncAccount = (event) => {
      if (event.key === null || event.key === 'token' || event.key === 'user') {
        window.location.reload();
      }
    };
    window.addEventListener('storage', syncAccount);
    return () => window.removeEventListener('storage', syncAccount);
  }, []);

  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light');

  return token
    ? <Dashboard key={token} theme={theme} onToggleTheme={toggleTheme} />
    : <Login theme={theme} onToggleTheme={toggleTheme} />;
}

export default App;