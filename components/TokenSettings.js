'use client';

import { useState, useEffect } from 'react';

/**
 * TokenSettings component - Modal for configuring Rollbar access token
 * Stores token in localStorage for demo purposes
 */
export default function TokenSettings({ isOpen, onClose }) {
  const [token, setToken] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load token from localStorage when modal opens
      const savedToken = localStorage.getItem('rollbar_client_token') || '';
      setToken(savedToken);
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (token.trim()) {
      localStorage.setItem('rollbar_client_token', token.trim());
      setIsSaved(true);
      setTimeout(() => {
        onClose();
        // Reload page to reinitialize Rollbar with new token
        window.location.reload();
      }, 1000);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('rollbar_client_token');
    setToken('');
    setIsSaved(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] bg-rollbar-bg-card rounded-xl shadow-xl z-[1000] p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-rollbar-yellow text-2xl font-semibold m-0">
            Rollbar Configuration
          </h2>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-white text-3xl cursor-pointer p-0 w-8 h-8 flex items-center justify-center transition-colors hover:text-rollbar-yellow"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label htmlFor="token-input" className="block text-white text-sm font-semibold mb-2">
              Client Access Token
            </label>
            <input
              id="token-input"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your Rollbar client access token..."
              className="w-full bg-rollbar-bg-dark border border-rollbar-border text-white px-4 py-3 rounded-lg text-sm focus:outline-none focus:border-rollbar-blue transition-colors"
            />
          </div>

          <div className="bg-rollbar-bg-dark border border-rollbar-border rounded-lg p-4">
            <p className="text-sm text-rollbar-gray-text leading-relaxed m-0">
              <strong className="text-white">Getting Started:</strong>
            </p>
            <ol className="text-sm text-rollbar-gray-text mt-2 ml-4 space-y-1">
              <li>1. Go to the Getting Started section of your installed Rollbar product</li>
              <li>2. Find token with <strong className="text-white">CLIENT_TOKEN</strong> scope</li>
              <li>3. Copy the token and paste it above</li>
              <li>4. Click "Save Token" to start sending events and Replay</li>
            </ol>
          </div>

          {isSaved && (
            <div className="bg-[rgba(16,185,129,0.18)] border border-rollbar-green text-rollbar-green rounded-lg p-3 text-sm">
              ✓ Token saved! Reloading to apply changes...
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={!token.trim() || isSaved}
              className="flex-1 btn-blue-lg"
            >
              Save Token
            </button>
            <button
              onClick={handleClear}
              className="btn-outline"
            >
              Clear Token
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
