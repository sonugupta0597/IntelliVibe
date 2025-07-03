import { Routes, Route } from 'react-router-dom';

// Layout Component
import Header from './components/layout/Header';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs'; // <-- The new public jobs page
import EmployerDashboard from './pages/EmployerDashboard'; // <-- The new protected employer page
import CandidateDashboard from './pages/CandidateDashboard'; // <-- Add a placeholder for this too
import QuizPage from './pages/QuizPage';

// Auth Component
import ProtectedRoute from './components/auth/ProtectedRoute';
import ApplicantsPage from './pages/ApplicantsPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container py-8">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* These routes are accessible to everyone */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/candidate/quiz/:applicationId" element={
            <ProtectedRoute role="candidate">
                <QuizPage />
            </ProtectedRoute>
          } />

          {/* --- PROTECTED EMPLOYER ROUTES --- */}
          {/* These routes can only be accessed by logged-in users with the 'employer' role */}
          <Route element={<ProtectedRoute requiredRole="employer" />}>
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            {/* You can add more employer-only routes here later */}
            {/* e.g., <Route path="/employer/job/:id/applicants" element={<ApplicantsPage />} /> */}
          </Route>


          {/* --- PROTECTED CANDIDATE ROUTES --- */}
          {/* These routes can only be accessed by logged-in users with the 'candidate' role */}
          <Route element={<ProtectedRoute requiredRole="candidate" />}>
             <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
             <Route path="/candidate/quiz/:applicationId" element={<QuizPage />} />
             {/* e.g., <Route path="/candidate/applications" element={<MyApplications />} /> */}
          </Route>


          {/* --- CATCH-ALL ROUTE (Optional) --- */}
          {/* This can be a 404 Not Found page */}
          {/* <Route path="*" element={<NotFound />} /> */}
                    {/* --- PROTECTED EMPLOYER ROUTES --- */}
          <Route element={<ProtectedRoute requiredRole="employer" />}>
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            {/* ADD THIS NEW ROUTE */}
            <Route path="/employer/job/:jobId/applicants" element={<ApplicantsPage />} /> 
          </Route>


        </Routes>
      </main>
    </div>
  );
}

export default App;