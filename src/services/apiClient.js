import axios from 'axios';

import { API_BASE_URL } from '@env';

import logger, {
  sanitizeLogValue,
  sanitizeUrl,
} from './logger';

import {
  getAccessToken,
} from '../storage/authStorage';

import {
  refreshAccessToken,
} from './auth/refreshToken';

const API = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    'Content-Type':
      'application/json',
  },

  timeout: 15000,
});

let globalAccessToken = null;

let globalRefreshToken = null;

let globalSocietyId = null;

let globalOwnerId = null;

let globalProfile = null;

let globalProfiles = [];

export const setGlobalTokens =
  (accessToken, refreshToken) => {
    globalAccessToken =
      accessToken || null;

    globalRefreshToken =
      refreshToken || null;

    if (globalAccessToken) {
      API.defaults.headers.common.Authorization =
        `Bearer ${globalAccessToken}`;
    } else {
      delete API.defaults.headers.common.Authorization;
    }
  };

export const getGlobalTokens =
  () => ({
    accessToken:
      globalAccessToken,

    refreshToken:
      globalRefreshToken,
  });

export const setGlobalIds =
  (societyId, ownerId) => {
    globalSocietyId =
      societyId ?? null;

    globalOwnerId =
      ownerId ?? null;
  };

export const getGlobalIds =
  () => ({
    societyId:
      globalSocietyId,

    ownerId:
      globalOwnerId,
  });

export const getGlobalSocietyId =
  () => globalSocietyId;

export const getGlobalOwnerId =
  () => globalOwnerId;

export const setGlobalProfile =
  (profile) => {
    globalProfile =
      profile || null;

    if (profile) {
      setGlobalIds(
        profile.societyId ??
          profile.SocietyId,

        profile.ownerId ??
          profile.OwnerId
      );
    }
  };

export const getGlobalProfile =
  () => globalProfile;

export const setGlobalProfiles =
  (profiles) => {
    globalProfiles =
      Array.isArray(profiles)
        ? profiles
        : [];
  };

export const getGlobalProfiles =
  () => globalProfiles;

const buildRequestUrl = (
  config = {}
) => {
  const query = config.params
    ? `?${new URLSearchParams(
        config.params
      ).toString()}`
    : '';

  return sanitizeUrl(
    `${config.baseURL || ''}${
      config.url || ''
    }${query}`
  );
};

API.interceptors.request.use(
  async (config) => {
    try {
      const token =
        await getAccessToken();

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

      config.metadata = {
        requestId: `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

        startTime:
          Date.now(),
      };

      logger.info(
        'api_request_started',
        {
          requestId:
            config.metadata
              .requestId,

          method:
            config.method?.toUpperCase(),

          url: buildRequestUrl(
            config
          ),

          headers:
            sanitizeLogValue(
              config.headers
            ),

          params:
            config.params,

          requestBody:
            config.data,
        }
      );

      return config;
    } catch (error) {
      return Promise.reject(
        error
      );
    }
  }
);

API.interceptors.response.use(
  (response) => {
    const durationMs =
      Date.now() -
      (response.config?.metadata
        ?.startTime ||
        Date.now());

    logger.info(
      'api_request_completed',
      {
        requestId:
          response.config
            ?.metadata?.requestId,

        method:
          response.config?.method?.toUpperCase(),

        status:
          response.status,

        url: buildRequestUrl(
          response.config
        ),

        durationMs,

        responseBody:
          response.data,
      }
    );

    return response;
  },

  async (error) => {
    const originalRequest =
      error.config;

    const durationMs =
      Date.now() -
      (error.config?.metadata
        ?.startTime ||
        Date.now());

    logger.warn(
      'api_request_failed',
      {
        requestId:
          error.config?.metadata
            ?.requestId,

        method:
          error.config?.method?.toUpperCase(),

        status:
          error.response?.status,

        url: buildRequestUrl(
          error.config
        ),

        params:
          error.config?.params,

        requestData:
          error.config?.data,

        responseData:
          error.response?.data,

        durationMs,

        code:
          error.code,

        message:
          error.message,
      }
    );

    if (
      error?.response?.status ===
        401 &&
      !originalRequest?._retry
    ) {
      originalRequest._retry =
        true;

      try {
        const newAccessToken =
          await refreshAccessToken();

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return API(
          originalRequest
        );
      } catch (
        refreshError
      ) {
        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);

export default API;
