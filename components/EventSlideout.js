/**
 * EventSlideout component - displays event history in a right-side slideout
 * @param {boolean} isOpen - Whether the slideout is visible
 * @param {Function} onClose - Callback to close the slideout
 * @param {Array} events - Array of event objects with id, level, rollbarItemUuid, status, timestamp
 */
export default function EventSlideout({ isOpen, onClose, events }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
        onClick={onClose}
      />

      {/* Slideout panel */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-[600px] bg-rollbar-bg-card shadow-[-4px_0_20px_rgba(0,0,0,0.3)] z-[1000] flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-rollbar-border">
          <h2 className="text-rollbar-yellow text-2xl font-semibold m-0">
            Event Log Details
          </h2>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-white text-4xl cursor-pointer p-0 w-9 h-9 flex items-center justify-center transition-colors hover:text-rollbar-yellow"
            aria-label="Close slideout"
          >
            ×
          </button>
        </div>

        {/* Event list */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {events.length === 0 ? (
            <p className="text-white text-center py-8">No events sent yet</p>
          ) : (
            <>
              <div className="border border-rollbar-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="bg-rollbar-border text-white px-4 py-3.5 text-left font-semibold text-sm">
                        Event
                      </th>
                      <th className="bg-rollbar-border text-white px-4 py-3.5 text-left font-semibold text-sm">
                        Item UUID
                      </th>
                      <th className="bg-rollbar-border text-white px-4 py-3.5 text-left font-semibold text-sm">
                        Status
                      </th>
                      <th className="bg-rollbar-border text-white px-4 py-3.5 text-left font-semibold text-sm">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event, index) => (
                      <tr
                        key={event.id}
                        className="transition-colors hover:bg-[rgba(68,132,255,0.1)]"
                      >
                        <td className={`px-4 py-3 text-left text-white text-sm ${index !== events.length - 1 ? 'border-b border-rollbar-border' : ''}`}>
                          <span className={`inline-flex items-center justify-center min-w-[68px] px-3 py-1.5 rounded-full text-xs font-semibold ${getLevelColor(event.level)}`}>
                            {event.level}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-left text-[rgba(255,255,255,0.75)] text-xs font-mono ${index !== events.length - 1 ? 'border-b border-rollbar-border' : ''}`}>
                          {event.rollbarItemUuid || '—'}
                        </td>
                        <td className={`px-4 py-3 text-left text-sm ${index !== events.length - 1 ? 'border-b border-rollbar-border' : ''}`}>
                          <span className={`inline-flex items-center justify-center min-w-[68px] px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-left text-[rgba(255,255,255,0.9)] text-sm ${index !== events.length - 1 ? 'border-b border-rollbar-border' : ''}`}>
                          {formatTimestamp(event.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Get Tailwind classes for level badge color
 */
function getLevelColor(level) {
  switch (level) {
    case 'info':
      return 'bg-[rgba(59,130,246,0.18)] text-[#3b82f6]';
    case 'warning':
      return 'bg-[rgba(251,146,60,0.18)] text-[#fb923c]';
    case 'error':
      return 'bg-[rgba(239,68,68,0.18)] text-[#ef4444]';
    case 'exception':
      return 'bg-[rgba(168,85,247,0.18)] text-[#a855f7]';
    default:
      return 'bg-[rgba(148,163,184,0.18)] text-[#94a3b8]';
  }
}

/**
 * Get Tailwind classes for status badge color
 * Handles both numeric HTTP status codes and string statuses
 */
function getStatusColor(status) {
  // Handle numeric status codes (HTTP response codes)
  if (typeof status === 'number' || !isNaN(Number(status))) {
    const numStatus = Number(status);
    if (numStatus >= 200 && numStatus < 300) {
      return 'bg-[rgba(16,185,129,0.18)] text-[#10b981]'; // Success (green)
    } else if (numStatus >= 400) {
      return 'bg-[rgba(239,68,68,0.18)] text-[#ef4444]'; // Error (red)
    }
  }

  // Handle string statuses
  switch (status) {
    case 'sent':
      return 'bg-[rgba(16,185,129,0.18)] text-[#10b981]';
    case 'queued':
      return 'bg-[rgba(251,146,60,0.18)] text-[#fb923c]';
    case 'error':
      return 'bg-[rgba(239,68,68,0.18)] text-[#ef4444]';
    default:
      return 'bg-[rgba(148,163,184,0.18)] text-[#94a3b8]';
  }
}

/**
 * Format ISO timestamp to readable format
 */
function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
