import { API_BASE_URL, LOG_ENDPOINT, LOG_RETENTION_DAYS } from '@env';

const SENSITIVE_KEY_PATTERN = /(authorization|password|token|otp|mobile|phone|email)/i;
const SENSITIVE_QUERY_PATTERN = /([?&][^=]*(authorization|password|token|otp|mobile|phone|email)[^=]*=)[^&]*/gi;
const MAX_STRING_LENGTH = 400;
const DEFAULT_LOG_ENDPOINT = '/Logs/client';
const DEFAULT_RETENTION_DAYS = 60;

const parseRetentionDays = (value) => {
  const days = Number(value);
  return Number.isFinite(days) && days > 0 ? days : DEFAULT_RETENTION_DAYS;
};

const joinUrl = (baseUrl, path) => {
  if (!baseUrl) return null;
  const cleanBase = String(baseUrl).replace(/\/+$/, '');
  const cleanPath = String(path || DEFAULT_LOG_ENDPOINT).replace(/^\/?/, '/');
  return `${cleanBase}${cleanPath}`;
};

const retentionDays = parseRetentionDays(LOG_RETENTION_DAYS);
const remoteLogUrl = joinUrl(API_BASE_URL, LOG_ENDPOINT);

const maskString = (value) => {
  if (!value) return value;

  const text = String(value);
  const digits = text.replace(/\D/g, '');

  if (digits.length >= 6) {
    return `${digits.slice(0, 2)}******${digits.slice(-2)}`;
  }

  if (text.includes('@')) {
    const [name, domain] = text.split('@');
    return `${name.slice(0, 2)}***@${domain}`;
  }

  return '***';
};

const trimString = (value) => {
  if (typeof value !== 'string' || value.length <= MAX_STRING_LENGTH) return value;
  return `${value.slice(0, MAX_STRING_LENGTH)}...`;
};

export const sanitizeUrl = (url) => {
  if (!url) return url;
  return String(url).replace(SENSITIVE_QUERY_PATTERN, '$1***');
};

export const sanitizeLogValue = (value, parentKey = '') => {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return sanitizeLogValue(parsed, parentKey);
    } catch {
      return SENSITIVE_KEY_PATTERN.test(parentKey) ? maskString(value) : trimString(value);
    }
  }

  if (typeof value !== 'object') {
    return SENSITIVE_KEY_PATTERN.test(parentKey) ? maskString(value) : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(item, parentKey));
  }

  return Object.entries(value).reduce((safeValue, [key, item]) => {
    safeValue[key] = SENSITIVE_KEY_PATTERN.test(key) ? maskString(item) : sanitizeLogValue(item, key);
    return safeValue;
  }, {});
};

const sendToServer = (entry) => {
  if (!remoteLogUrl || typeof fetch !== 'function') return;

  const expiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000).toISOString();
  const body = JSON.stringify({
    ...entry,
    retentionDays,
    expiresAt,
  });

  fetch(remoteLogUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }).catch(() => {});
};

const emit = (level, event, payload = {}) => {
  const entry = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...sanitizeLogValue(payload),
  };

  sendToServer(entry);

  if (!__DEV__) return;

  if (level === 'error') {
    console.error(event, entry);
    return;
  }

  if (level === 'warn') {
    console.warn(event, entry);
    return;
  }

  console.log(event, entry);
};

const logger = {
  info: (event, payload) => emit('info', event, payload),
  warn: (event, payload) => emit('warn', event, payload),
  error: (event, payload) => emit('error', event, payload),
};

export default logger;
