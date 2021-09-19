import React from 'react';
import { useErrorBoundary } from 'use-error-boundary';
// import { useRollbar } from '@rollbar/react';

import CompleteFailureScreen from './CompleteFailureScreen';

const AppErrorBoundary: React.FC = props => {
  const { children } = props;
  // const rollbar = useRollbar();

  const { ErrorBoundary, didCatch, error } = useErrorBoundary({
    // onDidCatch(errorObj, errorInfo) {
    //   rollbar?.warn(
    //     'unhandled error in application, user got a blank screen',
    //     errorObj,
    //     errorInfo,
    //   );
    // },
  });

  if (didCatch) {
    return <CompleteFailureScreen message={error.message} />;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default AppErrorBoundary;
