import API from '../apiClient';

import {
  saveAuthData,
} from '../../storage/authStorage';

import {
  authStore,
} from '../../stores/authStore';

import {
  mapSession,
} from './mapSession';

const getErrorMessage = (
  error
) => {
  const data =
    error?.response?.data;

  if (
    typeof data === 'string'
  ) {
    return data;
  }

  return (
    data?.message ||
    error?.message ||
    'OTP verification failed.'
  );
};

export const verifyOTP =
  async (phone, otp) => {
    try {
      const response =
        await API.post(
          '/Auth/verify-otp',
          {
            MobileNumber:
              phone,

            OtpCode: otp,
          }
        );

      const session =
        mapSession(
          response.data
        );

      // Add phone and potential name from input if missing in session
      if (session.user && !session.user.phone) {
        session.user.phone = phone;
      }

      await saveAuthData({
        accessToken:
          session.accessToken,

        refreshToken:
          session.refreshToken,

        user: {
          ...session.user,
          name: session.selectedProfile?.ownerName || session.selectedProfile?.OwnerName || session.user.username,
          phone: session.user.phone || session.selectedProfile?.ownerPhone || session.selectedProfile?.OwnerPhone || phone,

          selectedProfile:
            session.selectedProfile,

          selectedUnit:
            session.selectedUnit,

          ownerProfiles:
            session.ownerProfiles,
        },
      });

      authStore.setSession({
        ...session,
        user: {
          ...session.user,
          name: session.selectedProfile?.ownerName || session.selectedProfile?.OwnerName || session.user.username,
          phone: session.user.phone || session.selectedProfile?.ownerPhone || session.selectedProfile?.OwnerPhone || phone,
        }
      });

      return session;
    } catch (error) {
      throw new Error(
        getErrorMessage(
          error
        )
      );
    }
  };