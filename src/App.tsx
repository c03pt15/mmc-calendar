import React from 'react';
import MMCCalendar from './components/MMCCalendar';
import ResetPassword from './components/ResetPassword';

const App = () => {
  // Minimal routing without adding react-router: Supabase recovery
  // emails link to /reset-password, so serve that page here.
  const isResetPassword =
    typeof window !== 'undefined' &&
    window.location.pathname === '/reset-password';

  if (isResetPassword) {
    return (
      <div>
        <ResetPassword />
      </div>
    );
  }

  return (
    <div>
      <MMCCalendar />
      {/* Test deployment - updated via script */}
    </div>
  );
};

export default App; 