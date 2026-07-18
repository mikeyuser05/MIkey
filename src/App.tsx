import type { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { ThemeProvider } from '@context/ThemeContext';
import { GlobalProvider } from '@context/GlobalContext';
import { AppRoutes } from '@routes/AppRoutes';

function App(): ReactElement {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GlobalProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                },
              }}
            />
          </BrowserRouter>
        </GlobalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
