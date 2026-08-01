import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { MobileBottomBar } from './components/Mobile/MobileBottomBar';
import { AppLayout } from './components/Layout/AppLayout';
import { pwaService } from './services/pwa.service';
import { notificationService } from './services/notification.service';

// Context Providers
import { GlobalProvider } from './context/GlobalContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages & Feature Views
import DashboardPage from './pages/Dashboard/DashboardPage';
import AnalyticsPage from './pages/Analytics/AnalyticsPage';
import AlertsPage from './pages/Alerts/AlertsPage';
import SettingsPage from './pages/Settings/SettingsPage';

// Feature Components
import { PR11TriageHub } from './components/PR11TriageHub';
import { PR14HardwareLab } from './components/PR14HardwareLab';
import { PR15MultiNodeCommandCenter } from './components/PR15MultiNodeCommandCenter';
import { PR16OfflineSyncMonitor } from './components/PR16OfflineSyncMonitor';
import HealthCheck from './pages/HealthCheck';
import NotFound from './pages/NotFound';

export const App: React.FC = () => {
  useEffect(() => {
    pwaService.init();
    notificationService.requestPermission().then((granted) => {
      if (granted) {
        console.log('[App]: Push notifications authorized.');
      }
    });
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <GlobalProvider>
            <BrowserRouter>
              <Routes>
                {/* Wrap all main views inside AppLayout */}
                <Route element={<AppLayout />}>
                  {/* Core Dashboard */}
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  
                  {/* Dedicated Pages */}
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* Modules & Route Aliases */}
                  <Route path="/triage" element={<PR11TriageHub />} />
                  <Route path="/triage-hub" element={<PR11TriageHub />} />

                  <Route path="/command" element={<PR15MultiNodeCommandCenter />} />
                  <Route path="/command-center" element={<PR15MultiNodeCommandCenter />} />

                  <Route path="/offline" element={<PR16OfflineSyncMonitor />} />
                  <Route path="/offline-monitor" element={<PR16OfflineSyncMonitor />} />
                  <Route path="/offline-sync" element={<PR16OfflineSyncMonitor />} />

                  <Route path="/hardware" element={<PR14HardwareLab />} />
                  <Route path="/devices" element={<PR14HardwareLab />} />

                  {/* Health & Fallbacks */}
                  <Route path="/health" element={<HealthCheck />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              
              {/* Mobile Navigation */}
              <MobileBottomBar />
            </BrowserRouter>
          </GlobalProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
