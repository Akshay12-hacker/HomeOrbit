const initialState = {
  hydrated: false,

  authenticated: false,

  accessToken: null,

  refreshToken: null,

  user: null,

  selectedProfile: null,

  selectedUnit: null,

  ownerProfiles: [],
};

let state = {
  ...initialState,
};

const listeners = new Set();

const emitChange = () => {
  listeners.forEach(
    (listener) => {
      listener(state);
    }
  );
};

export const authStore = {
  getState: () => state,

  subscribe: (listener) => {
    listeners.add(listener);

    return () => {
      listeners.delete(
        listener
      );
    };
  },

  setSession: (session) => {
    state = {
      ...state,

      hydrated: true,

      authenticated: true,

      accessToken:
        session.accessToken,

      refreshToken:
        session.refreshToken,

      user: session.user,

      selectedProfile:
        session.selectedProfile,

      selectedUnit:
        session.selectedUnit,

      ownerProfiles:
        session.ownerProfiles ||
        [],
    };

    emitChange();
  },

  hydrateComplete: () => {
    state = {
      ...state,

      hydrated: true,
    };

    emitChange();
  },

  updateSelectedUnit: (
    unit
  ) => {
    state = {
      ...state,

      selectedUnit: unit,
    };

    emitChange();
  },

  updateSelectedProfile: (
    profile
  ) => {
    state = {
      ...state,

      selectedProfile: profile,

      selectedUnit:
        profile?.unitOwner?.[0] ||
        null,

      user: state.user ? {
        ...state.user,
        name: profile?.ownerName || profile?.OwnerName || profile?.name || profile?.Name || state.user.name,
        phone: profile?.ownerPhone || profile?.OwnerPhone || profile?.phone || profile?.Phone || state.user.phone,
      } : null
    };

    emitChange();
  },

  clearSession: () => {
    state = {
      ...initialState,

      hydrated: true,
    };

    emitChange();
  },
};