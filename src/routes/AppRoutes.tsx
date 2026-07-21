import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@components/Layout/AppLayout';
import { ProtectedRoute } from '@components/common/ProtectedRoute';
import { DashboardPage } from '@pages/Dashboard/DashboardPage';
import { LoginPage } from '@pages/Auth/LoginPage';
import { NotFoundPage } from '@pages/NotFound/NotFoundPage';
import { ROUTES } from '@constants/routes.constants';

// PR4 Functional Page Views
import DevicesPage from '@pages/Devices/DevicesPage';
import AnalyticsPage from '@pages/Analytics/AnalyticsPage';
import AlertsPage from '@pages/Alerts/AlertsPage';
import SettingsPage from '@pages/Settings/SettingsPage';

export function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          
          {/* PR4 Connected Views */}
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
}