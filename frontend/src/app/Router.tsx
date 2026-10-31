import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { OwnerShell } from './layouts/OwnerShell';
import { PublicShell } from './layouts/PublicShell';

// Lazy loaded routes
const LandingPage = lazy(() =>
  import('../features/landing/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import('../features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('../features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const OnboardingWizard = lazy(() =>
  import('../features/onboarding/OnboardingWizard').then((m) => ({ default: m.OnboardingWizard }))
);
const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const RecordsPage = lazy(() =>
  import('../features/records/RecordsPage').then((m) => ({ default: m.RecordsPage }))
);
const ReviewQueuePage = lazy(() =>
  import('../features/records/ReviewQueuePage').then((m) => ({ default: m.ReviewQueuePage }))
);
const ImportWizardPage = lazy(() =>
  import('../features/records/import/ImportWizardPage').then((m) => ({
    default: m.ImportWizardPage,
  }))
);
const AnalyticsPage = lazy(() =>
  import('../features/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const EvidenceCentrePage = lazy(() =>
  import('../features/evidence/EvidenceCentrePage').then((m) => ({
    default: m.EvidenceCentrePage,
  }))
);
const PassportPage = lazy(() =>
  import('../features/passport/PassportPage').then((m) => ({ default: m.PassportPage }))
);
const SharePassportPage = lazy(() =>
  import('../features/passport/SharePassportPage').then((m) => ({ default: m.SharePassportPage }))
);
const ProfilePage = lazy(() =>
  import('../features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const InstitutionViewPage = lazy(() =>
  import('../features/institution/InstitutionViewPage').then((m) => ({
    default: m.InstitutionViewPage,
  }))
);
const NotFoundPage = lazy(() =>
  import('../features/credits/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Fallback skeleton loader
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-[#F4E6CE] flex flex-col items-center justify-center space-y-3 font-mono text-xs text-[#76513B]">
    <div className="w-8 h-8 rounded-full border-2 border-[#B94F35] border-t-transparent animate-spin" />
    <div>Opening ledger...</div>
  </div>
);

export const router = createBrowserRouter([
  // Top-level aliases for direct navigation
  {
    path: '/dashboard',
    element: <Navigate to="/app" replace />,
  },
  {
    path: '/transactions',
    element: <Navigate to="/app/records" replace />,
  },
  {
    path: '/import',
    element: <Navigate to="/app/records/import" replace />,
  },
  {
    path: '/reconciliation',
    element: <Navigate to="/app/records/review" replace />,
  },
  {
    path: '/insights',
    element: <Navigate to="/app/analytics" replace />,
  },
  {
    path: '/passport',
    element: <Navigate to="/app/passport" replace />,
  },
  {
    path: '/settings',
    element: <Navigate to="/app/profile" replace />,
  },

  // Public routes
  {
    path: '/',
    element: <PublicShell />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: 'onboarding',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <OnboardingWizard />
          </Suspense>
        ),
      },
    ],
  },

  // Institutional Read-Only View Routes
  {
    path: '/institution/:token',
    element: (
      <Suspense fallback={<PageLoadingFallback />}>
        <InstitutionViewPage />
      </Suspense>
    ),
  },
  {
    path: '/institution',
    element: <Navigate to="/institution/demo" replace />,
  },

  // Owner App routes (/app/*)
  {
    path: '/app',
    element: <OwnerShell />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'records',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <RecordsPage />
          </Suspense>
        ),
      },
      {
        path: 'records/review',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <ReviewQueuePage />
          </Suspense>
        ),
      },
      {
        path: 'records/import',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <ImportWizardPage />
          </Suspense>
        ),
      },
      {
        path: 'analytics',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <AnalyticsPage />
          </Suspense>
        ),
      },
      {
        path: 'evidence',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <EvidenceCentrePage />
          </Suspense>
        ),
      },
      {
        path: 'passport',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <PassportPage />
          </Suspense>
        ),
      },
      {
        path: 'passport/share',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <SharePassportPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<PageLoadingFallback />}>
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
  },

  // 404 Catch-All
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoadingFallback />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);
