import Rollbar from 'rollbar/replay';

let rollbarInstance = null;

/**
 * Get access token from localStorage or environment variables
 */
function getAccessToken() {
  // Check localStorage first (for public demo)
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('rollbar_client_token');
    if (localToken) {
      return localToken;
    }
  }

  // Fall back to environment variable
  return process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN;
}

/**
 * Check if session replay should be enabled on initialization
 */
function shouldEnableReplay() {
  if (typeof window === 'undefined') return false;
  const replaySetting = localStorage.getItem('rollbar_session_replay_enabled');
  return replaySetting === 'true';
}

/**
 * Get or initialize the Rollbar client instance
 * Session replay is always configured but may start as disabled
 */
export function getRollbar() {
  // Return existing instance if already initialized
  if (rollbarInstance) {
    return rollbarInstance;
  }

  const accessToken = getAccessToken();
  const replayEnabled = shouldEnableReplay();

  console.log('Initializing Rollbar with session replay:', replayEnabled);

  // Initialize Rollbar with browser configuration
  // Session replay must be enabled at init time, but autoStart controls recording
  const config = {
    accessToken: accessToken,
    environment: process.env.NEXT_PUBLIC_ROLLBAR_ENV || 'development',
    captureUncaught: false, // Manual control for demo
    captureUnhandledRejections: false,
    enabled: !!accessToken, // Only enable if token is present
    replay: {
      enabled: true, // Always enabled to allow runtime start/stop
      autoStart: replayEnabled, // Start recording based on user preference
    },
    payload: {
      client: {
        javascript: {
          code_version: '1.0.0',
          source_map_enabled: false,
        },
      },
    },
  };

  console.log('Rollbar config:', config);

  rollbarInstance = new Rollbar(config);
  return rollbarInstance;
}

/**
 * Start session replay recording
 * Triggers a direct replay capture
 */
export function startSessionReplay() {
  if (typeof window === 'undefined') return;

  // Save preference
  localStorage.setItem('rollbar_session_replay_enabled', 'true');

  const rollbar = getRollbar();

  // Trigger a direct replay to start capturing
  if (rollbar && typeof rollbar.triggerDirectReplay === 'function') {
    console.log('Starting session replay recording');
    rollbar.triggerDirectReplay({ tags: ['manual-start'] });
  } else {
    console.warn('triggerDirectReplay not available, page reload required');
    // Reload page to reinitialize with autoStart: true
    window.location.reload();
  }

  return rollbar;
}

/**
 * Stop session replay recording
 * Note: This requires a page reload to fully stop recording
 */
export function stopSessionReplay() {
  if (typeof window === 'undefined') return;

  // Save preference
  localStorage.setItem('rollbar_session_replay_enabled', 'false');

  console.log('Session replay will stop on next page load');

  // Session replay can't be stopped once started without reloading
  // Reload page to reinitialize with autoStart: false
  window.location.reload();
}

/**
 * Send a log event to Rollbar
 * @param {string} level - Log level: 'debug', 'info', 'warning', 'error', 'critical'
 * @param {string} message - Log message
 * @returns {Promise<Object>} Result with uuid and status code
 */
export async function sendLog(level, message) {
  const rollbar = getRollbar();

  return new Promise((resolve) => {
    rollbar[level](message, (err, data) => {
      if (err) {
        console.error('Rollbar error:', err);
        resolve({
          uuid: null,
          status: err.status || err.statusCode || 500
        });
      } else {
        // Extract UUID from result object and status code
        const uuid = data?.result?.uuid || data?.uuid || null;
        const statusCode = data?.err === 0 ? 200 : (data?.status || data?.statusCode || 202);

        console.log('Rollbar response:', data); // Debug log

        resolve({
          uuid: uuid,
          status: statusCode
        });
      }
    });
  });
}

/**
 * Send an exception to Rollbar
 * @param {Error} error - Error object to send
 * @returns {Promise<Object>} Result with uuid and status code
 */
export async function sendException(error) {
  const rollbar = getRollbar();

  return new Promise((resolve) => {
    rollbar.error(error, (err, data) => {
      if (err) {
        console.error('Rollbar error:', err);
        resolve({
          uuid: null,
          status: err.status || err.statusCode || 500
        });
      } else {
        // Extract UUID from result object and status code
        const uuid = data?.result?.uuid || data?.uuid || null;
        const statusCode = data?.err === 0 ? 200 : (data?.status || data?.statusCode || 202);

        console.log('Rollbar response:', data); // Debug log

        resolve({
          uuid: uuid,
          status: statusCode
        });
      }
    });
  });
}
