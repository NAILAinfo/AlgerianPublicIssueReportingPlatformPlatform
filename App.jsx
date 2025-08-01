import { useState } from "react";
import { Header } from "./components/Header.jsx";
import { UserReportScreen } from "./components/UserReportScreen.jsx";
import { AdminDashboard } from "./components/AdminDashboard.jsx";
import { StatsDashboard } from "./components/StatsDashboard.jsx";
import { Login } from "./components/Login.jsx";
import { SignUp } from "./components/SignUp.jsx";

export default function App() {
  const [activeView, setActiveView] = useState('user');
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setActiveView('admin'); // Redirect to admin dashboard after login
  };

  const handleSignUp = (userData) => {
    setCurrentUser(userData);
    setActiveView('admin'); // Redirect to admin dashboard after signup
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('user'); // Redirect to user view after logout
  };

  const handleViewChange = (view) => {
    // If trying to access admin without being logged in, show login
    if (view === 'admin' && !currentUser) {
      setActiveView('login');
      return;
    }
    
    setActiveView(view);
  };

  const renderCurrentView = () => {
    switch (activeView) {
      case 'user':
        return <UserReportScreen currentUser={currentUser} />;
      
      case 'admin':
        // Protected route - only accessible if logged in
        if (!currentUser) {
          return <Login 
            onLogin={handleLogin} 
            onSwitchToSignup={() => setAuthView('signup')} 
          />;
        }
        return <AdminDashboard currentUser={currentUser} />;
      
      case 'stats':
        return <StatsDashboard />;
      
      case 'login':
        if (authView === 'signup') {
          return <SignUp 
            onSignUp={handleSignUp} 
            onSwitchToLogin={() => setAuthView('login')} 
          />;
        }
        return <Login 
          onLogin={handleLogin} 
          onSwitchToSignup={() => setAuthView('signup')} 
        />;
      
      case 'signup':
        return <SignUp 
          onSignUp={handleSignUp} 
          onSwitchToLogin={() => setAuthView('login')} 
        />;
      
      default:
        return <UserReportScreen currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeView={activeView} 
        onViewChange={handleViewChange}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
}