'use client';

import { useState, useEffect } from 'react';

/**
 * TokenBanner - Shows a notice when no Rollbar token is configured
 * Always visible when no token is present (not dismissible)
 */
export default function TokenBanner({ onOpenSettings }) {
  const [hasToken, setHasToken] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage or env
    const localToken = localStorage.getItem('rollbar_client_token');
    const envToken = process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN;

    setHasToken(!!(localToken || envToken));
  }, []);

  // Always show banner when no token is configured (not dismissible)
  if (hasToken) return null;

  return (
    <div className="token-banner">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-white text-lg font-semibold m-0 mb-2">
            Welcome to the Rollbar Demo!
          </h3>
          <p className="text-white text-sm leading-relaxed m-0 mb-3">
            To get started, you'll need to configure your Rollbar Client Access Token. This token allows the demo to send events to your Rollbar project.
          </p>
          <button
            onClick={onOpenSettings}
            className="btn-blue"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configure Token
          </button>
        </div>
      </div>
    </div>
  );
}
