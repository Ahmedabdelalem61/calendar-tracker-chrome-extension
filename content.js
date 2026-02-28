(function () {
  if (document.getElementById('meetings-widget-host')) return;

  const host = document.createElement('div');
  host.id = 'meetings-widget-host';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .widget-container {
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #1a1a2e;
    }

    /* Collapsed state — circular badge */
    .widget-collapsed {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
    }

    .widget-collapsed:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .widget-collapsed svg {
      width: 26px;
      height: 26px;
    }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #4f46e5;
      color: white;
      font-size: 11px;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
    }

    .badge.urgent {
      background: #ef4444;
      animation: pulse-badge 1.5s ease-in-out infinite;
    }

    @keyframes pulse-badge {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    /* Expanded state */
    .widget-expanded {
      width: 320px;
      max-height: 440px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.82);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      animation: slideUp 0.25s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .widget-header h2 {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a2e;
      letter-spacing: -0.01em;
    }

    .collapse-btn {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: none;
      background: rgba(0, 0, 0, 0.05);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      color: #64748b;
    }

    .collapse-btn:hover {
      background: rgba(0, 0, 0, 0.1);
    }

    .meetings-list {
      max-height: 340px;
      overflow-y: auto;
      padding: 8px 12px 12px;
    }

    .meetings-list::-webkit-scrollbar {
      width: 4px;
    }

    .meetings-list::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 4px;
    }

    .meeting-card {
      padding: 10px 12px;
      border-radius: 10px;
      margin-bottom: 6px;
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid rgba(0, 0, 0, 0.04);
      transition: background 0.15s;
    }

    .meeting-card:last-child {
      margin-bottom: 0;
    }

    .meeting-card:hover {
      background: rgba(255, 255, 255, 0.9);
    }

    .meeting-card.ongoing {
      border-left: 3px solid #22c55e;
      background: rgba(34, 197, 94, 0.06);
    }

    .meeting-card.soon {
      border-left: 3px solid #f59e0b;
      background: rgba(245, 158, 11, 0.06);
    }

    .meeting-title {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .meeting-time {
      font-size: 11.5px;
      color: #64748b;
      margin-bottom: 6px;
    }

    .meeting-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .countdown {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 6px;
      white-space: nowrap;
    }

    .countdown.ongoing {
      background: rgba(34, 197, 94, 0.12);
      color: #16a34a;
    }

    .countdown.soon {
      background: rgba(245, 158, 11, 0.12);
      color: #d97706;
    }

    .countdown.later {
      background: rgba(100, 116, 139, 0.1);
      color: #64748b;
    }

    .join-btn {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 6px;
      border: none;
      background: #4f46e5;
      color: white;
      cursor: pointer;
      transition: background 0.15s;
      text-decoration: none;
      display: inline-block;
    }

    .join-btn:hover {
      background: #4338ca;
    }

    .empty-state {
      text-align: center;
      padding: 32px 16px;
      color: #94a3b8;
    }

    .empty-state svg {
      width: 40px;
      height: 40px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .empty-state p {
      font-size: 13px;
    }

    .error-state {
      text-align: center;
      padding: 24px 16px;
      color: #94a3b8;
      font-size: 12px;
    }

    .error-state .signin-hint {
      margin-top: 8px;
      font-size: 11px;
      color: #b0b8c8;
    }
  `;
  shadow.appendChild(style);

  const container = document.createElement('div');
  container.className = 'widget-container';
  shadow.appendChild(container);

  let isExpanded = false;
  let meetings = [];
  let countdownInterval = null;

  // Load saved state
  chrome.storage.local.get(['widgetExpanded', 'cachedMeetings'], (data) => {
    isExpanded = data.widgetExpanded || false;
    meetings = data.cachedMeetings || [];
    render();
    requestMeetings();
  });

  // Listen for updates from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'meetingsUpdated') {
      meetings = message.meetings || [];
      render();
    }
  });

  function requestMeetings() {
    chrome.runtime.sendMessage({ action: 'getMeetings' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[MeetingsWidget]', chrome.runtime.lastError.message);
        return;
      }
      if (response && response.success) {
        meetings = response.meetings;
        render();
      } else if (response && response.error) {
        console.error('[MeetingsWidget] Error:', response.error);
      }
    });
  }

  function render() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }

    container.innerHTML = '';

    if (isExpanded) {
      renderExpanded();
    } else {
      renderCollapsed();
    }
  }

  function renderCollapsed() {
    const activeMeetings = meetings;
    const hasSoon = activeMeetings.some((m) => {
      const diff = new Date(m.start) - new Date();
      return diff > 0 && diff < 15 * 60 * 1000;
    });

    const el = document.createElement('div');
    el.className = 'widget-collapsed';
    el.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      ${activeMeetings.length > 0 ? `<span class="badge ${hasSoon ? 'urgent' : ''}">${activeMeetings.length}</span>` : ''}
    `;
    el.addEventListener('click', () => {
      isExpanded = true;
      chrome.storage.local.set({ widgetExpanded: true });
      render();
    });
    container.appendChild(el);
  }

  function renderExpanded() {
    const el = document.createElement('div');
    el.className = 'widget-expanded';

    const header = document.createElement('div');
    header.className = 'widget-header';
    header.innerHTML = `
      <h2>Upcoming Meetings</h2>
      <button class="collapse-btn" title="Collapse">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    `;
    header.querySelector('.collapse-btn').addEventListener('click', () => {
      isExpanded = false;
      chrome.storage.local.set({ widgetExpanded: false });
      render();
    });
    el.appendChild(header);

    const list = document.createElement('div');
    list.className = 'meetings-list';

    const timedMeetings = meetings;

    if (timedMeetings.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
          </svg>
          <p>No upcoming meetings</p>
        </div>
      `;
    } else {
      timedMeetings.forEach((meeting) => {
        const card = createMeetingCard(meeting);
        list.appendChild(card);
      });
    }

    el.appendChild(list);
    container.appendChild(el);

    // Start countdown timer
    countdownInterval = setInterval(() => {
      updateCountdowns();
    }, 1000);
  }

  function createMeetingCard(meeting) {
    const card = document.createElement('div');
    card.className = 'meeting-card';

    const now = new Date();
    const start = new Date(meeting.start);
    const end = meeting.end ? new Date(meeting.end) : null;
    const diff = start - now;

    if (diff < 0 && end && now < end) {
      card.classList.add('ongoing');
    } else if (diff > 0 && diff < 15 * 60 * 1000) {
      card.classList.add('soon');
    }

    const timeStr = meeting.isAllDay ? 'All day' : formatTimeRange(meeting.start, meeting.end);
    const countdownStr = meeting.isAllDay ? 'All day' : getCountdownText(meeting);
    const countdownClass = meeting.isAllDay ? 'later' : getCountdownClass(meeting);

    card.innerHTML = `
      <div class="meeting-title" title="${escapeHtml(meeting.title)}">${escapeHtml(meeting.title)}</div>
      <div class="meeting-time">${timeStr}</div>
      <div class="meeting-meta">
        <span class="countdown ${countdownClass}" data-start="${meeting.start}" data-end="${meeting.end || ''}">${countdownStr}</span>
        ${meeting.meetLink ? `<a href="${escapeHtml(meeting.meetLink)}" target="_blank" rel="noopener" class="join-btn">Join</a>` : ''}
      </div>
    `;

    return card;
  }

  function updateCountdowns() {
    const countdowns = container.querySelectorAll('.countdown[data-start]');
    countdowns.forEach((el) => {
      const start = el.getAttribute('data-start');
      const end = el.getAttribute('data-end');
      const meeting = { start, end };
      el.textContent = getCountdownText(meeting);
      el.className = `countdown ${getCountdownClass(meeting)}`;
    });
  }

  function getCountdownText(meeting) {
    const now = new Date();
    const start = new Date(meeting.start);
    const end = meeting.end ? new Date(meeting.end) : null;
    const diff = start - now;

    if (diff < 0 && end && now < end) {
      const remaining = end - now;
      return `Ongoing \u00b7 ${formatDuration(remaining)} left`;
    }

    if (diff < 0) return 'Started';

    if (diff < 60 * 1000) return 'Starting now';
    if (diff < 60 * 60 * 1000) return `In ${Math.ceil(diff / 60000)} min`;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.ceil((diff % 3600000) / 60000);
    return `In ${hours}h ${mins}m`;
  }

  function getCountdownClass(meeting) {
    const now = new Date();
    const start = new Date(meeting.start);
    const end = meeting.end ? new Date(meeting.end) : null;
    const diff = start - now;

    if (diff < 0 && end && now < end) return 'ongoing';
    if (diff > 0 && diff < 15 * 60 * 1000) return 'soon';
    return 'later';
  }

  function formatTimeRange(startStr, endStr) {
    const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
    const start = new Date(startStr).toLocaleTimeString([], opts);
    if (!endStr) return start;
    const end = new Date(endStr).toLocaleTimeString([], opts);
    return `${start} \u2013 ${end}`;
  }

  function formatDuration(ms) {
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
