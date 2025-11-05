'use client';

import { useState } from 'react';
import { sendLog, sendException, startSessionReplay, stopSessionReplay } from '@/lib/rollbarClient';
import { getCurrentTimestamp, generateUuid } from '@/lib/time';
import EventSlideout from './EventSlideout';

/**
 * EventControls component - main control panel with buttons, counter, and slideout
 * Client component that manages event state and interactions
 */
export default function EventControls() {
  const [events, setEvents] = useState([]);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [isSessionReplayActive, setIsSessionReplayActive] = useState(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rollbar_session_replay_enabled') === 'true';
    }
    return false;
  });

  /**
   * Check if token is configured
   */
  const hasToken = () => {
    const localToken = localStorage.getItem('rollbar_client_token');
    const envToken = process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN;
    return !!(localToken || envToken);
  };

  /**
   * Handle sending a log event
   */
  const handleSendLog = async (level) => {
    if (isSending) return;

    if (!hasToken()) {
      setError('Please configure your Rollbar token in Settings first');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsSending(true);
    try {
      const message = `${level.charAt(0).toUpperCase() + level.slice(1)} message from demo app`;
      const result = await sendLog(level, message);

      // Add event to history
      const newEvent = {
        id: generateUuid(),
        level: level,
        rollbarItemUuid: result.uuid,
        status: result.status,
        timestamp: getCurrentTimestamp(),
      };

      setEvents((prev) => [newEvent, ...prev]);
    } catch (error) {
      console.error('Failed to send log:', error);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle sending an exception
   */
  const handleSendException = async () => {
    if (isSending) return;

    if (!hasToken()) {
      setError('Please configure your Rollbar token in Settings first');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsSending(true);
    try {
      const testError = new Error('Test exception from demo app');
      const result = await sendException(testError);

      // Add event to history
      const newEvent = {
        id: generateUuid(),
        level: 'exception',
        rollbarItemUuid: result.uuid,
        status: result.status,
        timestamp: getCurrentTimestamp(),
      };

      setEvents((prev) => [newEvent, ...prev]);
    } catch (error) {
      console.error('Failed to send exception:', error);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle toggling session replay
   */
  const handleToggleSessionReplay = () => {
    if (!hasToken()) {
      setError('Please configure your Rollbar token in Settings first');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (isSessionReplayActive) {
      stopSessionReplay();
      setIsSessionReplayActive(false);
    } else {
      startSessionReplay();
      setIsSessionReplayActive(true);
    }
  };

  return (
    <>
      {/* Error message */}
      {error && (
        <div className="mb-6 bg-[rgba(239,68,68,0.18)] border border-rollbar-red text-rollbar-red rounded-lg p-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Event log summary - counter with toggle */}
      <div className="mb-8">
        <div
          onClick={() => setIsSlideoutOpen(true)}
          className="bg-rollbar-bg-card rounded-lg p-4 border border-rollbar-border cursor-pointer transition-all hover:border-rollbar-blue flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <h3 className="text-rollbar-yellow text-base font-semibold m-0">
              Events Sent
            </h3>
            <div className="text-white text-2xl font-bold font-mono">
              {events.length}
            </div>
          </div>
          <button className="bg-transparent text-white border border-white px-4 py-1.5 rounded-md text-sm font-semibold transition-all hover:border-rollbar-blue hover:text-rollbar-blue">
            {isSlideoutOpen ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Send Single Event section */}
      <section className="bg-rollbar-bg-card rounded-xl p-8 mb-8 border border-rollbar-border">
        <div className="mb-6">
          <h2 className="text-white text-2xl font-semibold mt-2.5 mb-0">
            Send an Event
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSendLog('info')}
            disabled={isSending}
            className="event-btn"
          >
            Send info
          </button>

          <button
            onClick={() => handleSendLog('warning')}
            disabled={isSending}
            className="event-btn"
          >
            Send warning
          </button>

          <button
            onClick={() => handleSendLog('error')}
            disabled={isSending}
            className="event-btn"
          >
            Send error
          </button>

          <button
            onClick={handleSendException}
            disabled={isSending}
            className="event-btn"
          >
            Send exception
          </button>
        </div>
      </section>

      {/* Session Replay section */}
      <section className="bg-rollbar-bg-card rounded-xl p-8 mb-8 border border-rollbar-border">
        <div className="mb-6">
          <h2 className="text-white text-2xl font-semibold mt-2.5 mb-0">
            Session Replay
          </h2>
          <p className="text-rollbar-gray-text text-sm mt-2 mb-0">
            Capture user interactions, network activity, and console logs to debug issues faster.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleSessionReplay}
            className={`session-replay-toggle ${isSessionReplayActive ? 'active' : ''}`}
          >
            <span className="toggle-switch"></span>
          </button>
          <div>
            <div className="text-white font-semibold">
              {isSessionReplayActive ? 'Recording Active' : 'Recording Inactive'}
            </div>
            <div className="text-rollbar-gray-text text-sm">
              {isSessionReplayActive
                ? 'Session replay is capturing user interactions'
                : 'Click to start recording session replay'}
            </div>
          </div>
          {isSessionReplayActive && (
            <div className="recording-indicator"></div>
          )}
        </div>
      </section>

      {/* Legal notice */}
      <p className="text-rollbar-gray-text text-xs mb-8">
        Demo occurrences and replays will count against your monthly quotas. Each Rollbar account includes 5,000 Occurrences and 1,000 Replays per month for free.
      </p>

      {/* Event slideout */}
      <EventSlideout
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        events={events}
      />
    </>
  );
}
