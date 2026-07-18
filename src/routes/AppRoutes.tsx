import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@components/Layout/AppLayout';
import { ProtectedRoute } from '@components/common/ProtectedRoute';
import { DashboardPage } from '@pages/Dashboard/DashboardPage';
import { LoginPage } from '@pages/Auth/LoginPage';
import { NotFoundPage } from '@pages/NotFound/NotFoundPage';
import { ROUTES } from '@constants/routes.constants';

export function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        </Route>
      </Route>

      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
}
