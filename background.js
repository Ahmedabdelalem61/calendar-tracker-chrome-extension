const REFRESH_INTERVAL_MINUTES = 5;
const ALARM_NAME = 'refresh-meetings';
const CACHE_KEY = 'cachedMeetings';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: REFRESH_INTERVAL_MINUTES });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    fetchAndBroadcastMeetings();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getMeetings') {
    fetchMeetings()
      .then((meetings) => sendResponse({ success: true, meetings }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.action === 'signIn') {
    getAuthToken(true)
      .then((token) => {
        return fetchUserEmail(token).then((email) => {
          return fetchMeetings().then((meetings) => {
            sendResponse({ success: true, email, meetings });
          });
        });
      })
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.action === 'signOut') {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
            .finally(() => {
              chrome.storage.local.remove([CACHE_KEY, 'userEmail'], () => {
                sendResponse({ success: true });
              });
            });
        });
      } else {
        chrome.storage.local.remove([CACHE_KEY, 'userEmail'], () => {
          sendResponse({ success: true });
        });
      }
    });
    return true;
  }

  if (message.action === 'getAuthStatus') {
    chrome.storage.local.get('userEmail', (data) => {
      if (data.userEmail) {
        sendResponse({ signedIn: true, email: data.userEmail });
      } else {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
          if (chrome.runtime.lastError || !token) {
            sendResponse({ signedIn: false });
          } else {
            fetchUserEmail(token).then((email) => {
              sendResponse({ signedIn: true, email });
            }).catch(() => {
              sendResponse({ signedIn: false });
            });
          }
        });
      }
    });
    return true;
  }
});

function getAuthToken(interactive = false) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!token) {
        reject(new Error('No auth token received'));
      } else {
        resolve(token);
      }
    });
  });
}

function fetchUserEmail(token) {
  return fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.email) {
        chrome.storage.local.set({ userEmail: data.email });
        return data.email;
      }
      throw new Error('Could not get email');
    });
}

async function fetchMeetings() {
  const token = await getAuthToken(false);

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: tomorrow.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50'
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    const errBody = await res.text();
    console.error('[MeetingsWidget] API error:', res.status, errBody);
    throw new Error(`Calendar API error: ${res.status}`);
  }

  const data = await res.json();
  console.log('[MeetingsWidget] Fetched events:', data.items?.length || 0);

  const meetings = (data.items || [])
    .filter((event) => event.start && (event.start.dateTime || event.start.date))
    .map((event) => ({
      id: event.id,
      title: event.summary || '(No title)',
      start: event.start.dateTime || event.start.date,
      end: event.end?.dateTime || event.end?.date || null,
      meetLink: extractMeetingLink(event),
      location: event.location || null,
      isAllDay: !event.start.dateTime
    }));

  console.log('[MeetingsWidget] Processed meetings:', meetings.length, meetings.map(m => m.title));

  chrome.storage.local.set({ [CACHE_KEY]: meetings });
  return meetings;
}

function extractMeetingLink(event) {
  if (event.hangoutLink) return event.hangoutLink;

  const fields = [
    event.description || '',
    event.location || '',
    event.conferenceData?.entryPoints?.map((e) => e.uri).join(' ') || ''
  ].join(' ');

  const urlMatch = fields.match(
    /https?:\/\/[^\s<>"]+(?:meet\.google\.com|zoom\.us|teams\.microsoft\.com)[^\s<>"]*/i
  );
  return urlMatch ? urlMatch[0] : null;
}

async function fetchAndBroadcastMeetings() {
  try {
    const meetings = await fetchMeetings();
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
        chrome.tabs.sendMessage(tab.id, { action: 'meetingsUpdated', meetings }).catch(() => {});
      }
    }
  } catch (err) {
    // Not signed in or token expired — silent fail
  }
}
