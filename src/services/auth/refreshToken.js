import authApi from './authApi';

import {
  getRefreshToken,
  saveAuthData,
  getStoredUser,
} from '../../storage/authStorage';

export const refreshAccessToken =
  async () => {
    try {
      const refreshToken =
        await getRefreshToken();

      if (!refreshToken) {
        throw new Error(
          'No refresh token found.'
        );
      }

      const response =
        await authApi.post(
          '/Auth/refresh-token',
          {
            refreshToken,
          }
        );

      const user =
        await getStoredUser();

      await saveAuthData({
        accessToken:
          response.data
            .accessToken,

        refreshToken:
          response.data
            .refreshToken,

        user,
      });

      return response.data
        .accessToken;
    } catch (error) {
      throw error;
    }
  };