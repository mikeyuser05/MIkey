import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/Layout/AppLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import { LoginPage } from '../pages/Auth/LoginPage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';

// Pages & Feature Views
import DevicesPage from '../pages/Devices/DevicesPage';
import AnalyticsPage from '../pages/Analytics/AnalyticsPage';
import AlertsPage from '../pages/Alerts/AlertsPage';
import SettingsPage from '../pages/Settings/SettingsPage';
import { ReportsPanel } from '../components/analytics/ReportsPanel';

// PR Modules
import { PR11TriageHub } from '../components/PR11TriageHub';
import { PR14HardwareLab } from '../components/PR14HardwareLab';
import { PR15MultiNodeCommandCenter } from '../components/PR15MultiNodeCommandCenter';
import { PR16OfflineSyncMonitor } from '../components/PR16OfflineSyncMonitor';

export function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPanel />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Intelligence Modules */}
          <Route path="/triage" element={<PR11TriageHub />} />
          <Route path="/hardware-lab" element={<PR14HardwareLab />} />
          <Route path="/command-center" element={<PR15MultiNodeCommandCenter />} />
          <Route path="/offline-monitor" element={<PR16OfflineSyncMonitor />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}