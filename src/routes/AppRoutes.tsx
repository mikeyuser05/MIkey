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

// PR11–PR16 Functional Hubs
import { PR11TriageHub } from '../components/PR11TriageHub';
import { PR14HardwareLab } from '../components/PR14HardwareLab';
import { PR15MultiNodeCommandCenter } from '../components/PR15MultiNodeCommandCenter';
import { PR16OfflineSyncMonitor } from '../components/PR16OfflineSyncMonitor';

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

          {/* PR11-PR16 Connected Modules */}
          <Route path="/triage" element={<PR11TriageHub />} />
          <Route path="/hardware-lab" element={<PR14HardwareLab />} />
          <Route path="/command-center" element={<PR15MultiNodeCommandCenter />} />
          <Route path="/offline-monitor" element={<PR16OfflineSyncMonitor />} />
        </Route>
      </Route>

      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
}
