/**
 * Get current timestamp in ISO format
 * @returns {string} ISO 8601 timestamp
 */
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Generate a simple UUID v4
 * @returns {string} UUID string
 */
export function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
