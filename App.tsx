
import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import InstallPrompt from './components/InstallPrompt'; // Import InstallPrompt
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { APP_DATABASE } from './config';

// Pages
import Splash from './pages/Splash';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Loyalty from './pages/Loyalty';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Sessions from './pages/Sessions';
import Gallery from './pages/Gallery';
import Contests from './pages/Contests';
import Proposals from './pages/Proposals'; 
import Auth from './pages/Auth';
import AdminPanel from './pages/AdminPanel';

// Scroll to top helper
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Guard wrapper
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
};

// Admin Guard
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (user?.email !== APP_DATABASE.admin.email) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    
    // Hide nav on splash, auth, and admin screens
    const hideNav = location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/admin';

    return (
        <div className="max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark relative shadow-2xl overflow-x-hidden font-sans">
            {/* INSTALL PROMPT - Only shows if criteria met */}
            <InstallPrompt />

            <Routes>
                {/* Public Route */}
                <Route path="/auth" element={ isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />} />

                {/* Protected Routes */}
                <Route path="/" element={<RequireAuth><Splash /></RequireAuth>} />
                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
                <Route path="/loyalty" element={<RequireAuth><Loyalty /></RequireAuth>} />
                <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="/sessions" element={<RequireAuth><Sessions /></RequireAuth>} />
                <Route path="/gallery" element={<RequireAuth><Gallery /></RequireAuth>} />
                <Route path="/contests" element={<RequireAuth><Contests /></RequireAuth>} />
                <Route path="/proposals" element={<RequireAuth><Proposals /></RequireAuth>} />
                
                {/* Admin Route */}
                <Route path="/admin" element={<RequireAdmin><AdminPanel /></RequireAdmin>} />
            </Routes>
            {!hideNav && <Navigation />}
        </div>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
        <BookingProvider>
            <HashRouter>
                <ScrollToTop />
                <AppRoutes />
            </HashRouter>
        </BookingProvider>
    </AuthProvider>
  );
};

export default App;
