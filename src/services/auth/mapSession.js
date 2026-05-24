export const mapSession =
  (response) => {
    const profile =
      response.ownerProfiles?.[0] ||
      null;

    const defaultUnit =
      profile?.unitOwner?.[0] ||
      null;

    return {
      accessToken:
        response.accessToken,

      refreshToken:
        response.refreshToken,

      user: {
        userId:
          response.userId,

        username:
          response.username,

        email:
          response.email,

        roles:
          response.roles || [],
      },

      selectedProfile:
        profile,

      selectedUnit:
        defaultUnit,

      ownerProfiles:
        response.ownerProfiles ||
        [],

      requiresOwnerSelection:
        response.requiresOwnerSelection ||
        false,
    };
  };