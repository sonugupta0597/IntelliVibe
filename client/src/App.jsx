import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
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
import CandidateAnalytics from './pages/CandidateAnalytics';
import Profile from './pages/Profile';

function App() {
  return (
    <div
      className="min-h-screen flex flex-col text-gray-900"
      style={{
        background: '#F9FAFB',
        fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'sans-serif'"
      }}
    >
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full">
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
        <Footer />
        <Toaster richColors position="top-right" />
      </div>
    </div>
  );
}

export default App;
