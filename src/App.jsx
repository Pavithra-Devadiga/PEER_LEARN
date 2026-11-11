import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useModeTheme } from './context/ModeThemeContext';
import { AppShell } from './components/primitives/AppShell';

// Shared Pages
import { LandingPage } from './pages/shared/LandingPage';
import { LoginPage } from './pages/shared/LoginPage';
import { RegisterPage } from './pages/shared/RegisterPage';
import { ResetPasswordPage } from './pages/shared/ResetPasswordPage';
import { ProfilePage } from './pages/shared/ProfilePage';

// Student Mode Pages
import { StudentHomePage } from './pages/student/StudentHomePage';
import { BrowseSkillsPage } from './pages/student/BrowseSkillsPage';
import { TutorsPage } from './pages/student/TutorsPage';
import { StudentSessionsPage } from './pages/student/StudentSessionsPage';
import { LearningPage } from './pages/student/LearningPage';

// Tutor Mode Pages
import { TutorHomePage } from './pages/tutor/TutorHomePage';
import { MySkillsPage } from './pages/tutor/MySkillsPage';
import { RequestsPage } from './pages/tutor/RequestsPage';
import { TutorSessionsPage } from './pages/tutor/TutorSessionsPage';
import { ContributePage } from './pages/tutor/ContributePage';
import { InsightsPage } from './pages/tutor/InsightsPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useModeTheme();

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-sm text-text-muted font-medium">
        Loading your workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { mode, isAuthenticated } = useModeTheme();

  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Public Landing & Auth Routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to={`/${mode}/home`} replace /> : <LandingPage />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={`/${mode}/home`} replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to={`/${mode}/home`} replace /> : <RegisterPage />}
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected App Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Student Mode Routes */}
        <Route
          path="/student/home"
          element={
            <ProtectedRoute>
              <StudentHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/browse"
          element={
            <ProtectedRoute>
              <BrowseSkillsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tutors"
          element={
            <ProtectedRoute>
              <TutorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/sessions"
          element={
            <ProtectedRoute>
              <StudentSessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/learning"
          element={
            <ProtectedRoute>
              <LearningPage />
            </ProtectedRoute>
          }
        />

        {/* Tutor Mode Routes */}
        <Route
          path="/tutor/home"
          element={
            <ProtectedRoute>
              <TutorHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/skills"
          element={
            <ProtectedRoute>
              <MySkillsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/requests"
          element={
            <ProtectedRoute>
              <RequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/sessions"
          element={
            <ProtectedRoute>
              <TutorSessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/contribute"
          element={
            <ProtectedRoute>
              <ContributePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutor/insights"
          element={
            <ProtectedRoute>
              <InsightsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? `/${mode}/home` : '/'} replace />}
        />
      </Route>
    </Routes>
  );
}
