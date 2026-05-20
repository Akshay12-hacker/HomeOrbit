import axios from 'axios';
import { API_BASE_URL } from '@env';
import logger, { sanitizeLogValue, sanitizeUrl } from './logger';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let globalSocietyId = 1;
let globalOwnerId = 1;
let globalAccessToken = null;
let globalRefreshToken = null;
let globalOwnerProfile = null;
let globalOwnerProfiles = [];

export const setGlobalIds = (societyId, ownerId = 1) => {
  if (societyId) globalSocietyId = societyId;
  if (ownerId) globalOwnerId = ownerId;
};

export const setGlobalProfile = (profile) => {
  if (profile) globalOwnerProfile = profile;
};

export const setGlobalProfiles = (profiles) => {
  if (Array.isArray(profiles)) globalOwnerProfiles = profiles;
};

export const setGlobalTokens = (access, refresh) => {
  if (access) globalAccessToken = access;
  if (refresh) globalRefreshToken = refresh;
};

export const getGlobalSocietyId = () => globalSocietyId;
export const getGlobalOwnerId = () => globalOwnerId;
export const getGlobalProfile = () => globalOwnerProfile;
export const getGlobalProfiles = () => globalOwnerProfiles;

const buildRequestUrl = (config = {}) => {
  const query = config.params ? `?${new URLSearchParams(config.params).toString()}` : '';
  return sanitizeUrl(`${config.baseURL || ''}${config.url || ''}${query}`);
};

API.interceptors.request.use((config) => {
  if (globalAccessToken) {
    config.headers.Authorization = `Bearer ${globalAccessToken}`;
  }

  config.metadata = {
    startTime: Date.now(),
    requestId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };

  logger.info('api_request_started', {
    requestId: config.metadata.requestId,
    method: config.method?.toUpperCase(),
    url: buildRequestUrl(config),
    headers: sanitizeLogValue(config.headers),
    params: config.params,
    requestBody: config.data,
  });

  return config;
});

API.interceptors.response.use(
  (response) => {
    const durationMs = Date.now() - (response.config?.metadata?.startTime || Date.now());

    logger.info('api_request_completed', {
      requestId: response.config?.metadata?.requestId,
      method: response.config?.method?.toUpperCase(),
      status: response.status,
      url: buildRequestUrl(response.config),
      durationMs,
      responseBody: response.data,
    });

    return response;
  },
  (error) => {
    const durationMs = Date.now() - (error.config?.metadata?.startTime || Date.now());

    logger.warn('api_request_failed', {
      requestId: error.config?.metadata?.requestId,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      url: buildRequestUrl(error.config),
      params: error.config?.params,
      requestData: error.config?.data,
      responseData: error.response?.data,
      responseText: error.response?.data ? JSON.stringify(error.response.data) : undefined,
      durationMs,
      code: error.code,
      message: error.message,
      traceId: error.response?.data?.traceId,
    });

    return Promise.reject(error);
  }
);

export default API;
