import React from 'react';

import {
  authStore,
} from '../stores/authStore';

export default function useAuth() {
  const [
    authState,
    setAuthState,
  ] = React.useState(
    authStore.getState()
  );

  React.useEffect(() => {
    return authStore.subscribe(
      setAuthState
    );
  }, []);

  return authState;
}

export {
  useAuth,
};
