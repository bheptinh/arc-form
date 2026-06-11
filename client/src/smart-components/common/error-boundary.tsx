import type { PropsWithChildren } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useSelector } from 'react-redux';

import ErrorBlocker from '../../shared-components/app-guards/error-blocker';
import { useTranslation } from '../../api/hooks/useTranslation';

export default function ErrorBoundary({ children }: PropsWithChildren) {
  const translation = useTranslation();

  return (
    <ReactErrorBoundary
      FallbackComponent={({ resetErrorBoundary }) => (
        <ErrorBlocker onRetry={resetErrorBoundary} translation={translation} />
      )}
      onError={(error, info) => {
        console.error('[ErrorBoundary]', { error, info });

        fetch('/api/planner/bug_report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-token': R2D.token,
          },
          body: JSON.stringify({
            error: (error as Error)?.message,
            stack: info.componentStack || (error as Error)?.stack,
            project: R2D.controller.getProjectId(),
            url: window.location.href,
          }),
        });
      }}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
