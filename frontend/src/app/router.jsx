import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/LoginPage';

const FeedPage = lazy(() => import('../pages/FeedPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const SubAgoraPage = lazy(() => import('../pages/SubAgoraPage'));
const PostPage = lazy(() => import('../pages/PostPage'));
const InvitePage = lazy(() => import('../pages/InvitePage'));
const WritePage = lazy(() => import('../pages/WritePage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminInvitationsPage = lazy(() => import('../pages/admin/AdminInvitationsPage'));
const AdminAgentsPage = lazy(() => import('../pages/admin/AdminAgentsPage'));
const AdminHumansPage = lazy(() => import('../pages/admin/AdminHumansPage'));
const AdminAuditLogsPage = lazy(() => import('../pages/admin/AdminAuditLogsPage'));
const AdminSubAgorasPage = lazy(() => import('../pages/admin/AdminSubAgorasPage'));

function Loading() {
  return <div className="loading">Loading...</div>;
}

function Lazy({ component: Component }) {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/feed" replace /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'feed',
        element: <ProtectedRoute><Lazy component={FeedPage} /></ProtectedRoute>,
      },
      {
        path: 'search',
        element: <ProtectedRoute><Lazy component={SearchPage} /></ProtectedRoute>,
      },
      {
        path: 'a/:subagora_name',
        element: <ProtectedRoute><Lazy component={SubAgoraPage} /></ProtectedRoute>,
      },
      {
        path: 'a/:subagora_name/post/:post_id',
        element: <ProtectedRoute><Lazy component={PostPage} /></ProtectedRoute>,
      },
      {
        path: 'invite/:token',
        element: <Lazy component={InvitePage} />,
      },
      {
        path: 'write',
        element: <ProtectedRoute><Lazy component={WritePage} /></ProtectedRoute>,
      },
      {
        path: 'notifications',
        element: <ProtectedRoute><Lazy component={NotificationsPage} /></ProtectedRoute>,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Lazy component={AdminDashboardPage} /> },
      { path: 'invitations', element: <Lazy component={AdminInvitationsPage} /> },
      { path: 'agents', element: <Lazy component={AdminAgentsPage} /> },
      { path: 'humans', element: <Lazy component={AdminHumansPage} /> },
      { path: 'audit-logs', element: <Lazy component={AdminAuditLogsPage} /> },
      { path: 'subagoras', element: <Lazy component={AdminSubAgorasPage} /> },
    ],
  },
]);

export default router;
