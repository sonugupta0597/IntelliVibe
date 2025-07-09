import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs'; // <-- The new public jobs page
import EmployerDashboard from './pages/EmployerDashboard'; // <-- The new protected employer page
import CandidateDashboard from './pages/CandidateDashboard'; // <-- Add a placeholder for this too
import QuizPage from './pages/QuizPage';
import { Toaster } from 'sonner'; 
// Auth Component
import ProtectedRoute from './components/auth/ProtectedRoute';
import ApplicantsPage from './pages/ApplicantsPage';
import VideoInterviewPage from './pages/VideoInterviewPage';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import LightScatteringEffect from './components/LightScatteringEffect';
import CandidateAnalytics from './pages/CandidateAnalytics';
import Profile from './pages/Profile';
function App() {
  const location = useLocation();
  // Hide light scattering on video interview pages
  const hideLightEffect = location.pathname.startsWith('/candidate/interview') || location.pathname.startsWith('/employer/interview');
  return (
    <div
      className="min-h-screen flex flex-col text-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a0b2e 0%, #16213e 50%, #0f3460 100%)',
        fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'sans-serif'"
      }}
    >
      {!hideLightEffect && <LightScatteringEffect />}
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(233, 30, 99, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(156, 39, 176, 0.3) 0%, transparent 50%)`
        }}
      />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container py-8 pt-14">
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            {/* These routes are accessible to everyone */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
            {/* --- PROTECTED CANDIDATE ROUTES --- */}
            {/* These routes can only be accessed by logged-in users with the 'candidate' role */}
            <Route element={<ProtectedRoute requiredRole="candidate" />}>
               <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
               <Route path="/candidate/quiz/:applicationId" element={<QuizPage />} />
               {/* e.g., <Route path="/candidate/applications" element={<MyApplications />} /> */}
               <Route path="/candidate/interview/:applicationId" element={<VideoInterviewPage />} />
               <Route path="/candidate/analytics" element={<CandidateAnalytics />} />
            </Route>

                      {/* --- PROTECTED EMPLOYER ROUTES --- */}
            <Route element={<ProtectedRoute requiredRole="employer" />}>
              <Route path="/employer/dashboard" element={<EmployerDashboard />} />
              <Route path="/employer/job/:jobId/applicants" element={<ApplicantsPage />} /> 
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

          </Routes>
        </main>
        <Toaster richColors position="top-right" /> 
      </div>
    </div>
  );
}

export default App;