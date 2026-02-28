const signedOutEl = document.getElementById('signed-out');
const signedInEl = document.getElementById('signed-in');
const loadingEl = document.getElementById('loading');
const signInBtn = document.getElementById('sign-in-btn');
const signOutBtn = document.getElementById('sign-out-btn');
const userEmailEl = document.getElementById('user-email');
const nextMeetingEl = document.getElementById('next-meeting');
const noMeetingsEl = document.getElementById('no-meetings');
const nextTitleEl = document.getElementById('next-meeting-title');
const nextTimeEl = document.getElementById('next-meeting-time');

function showView(view) {
  signedOutEl.style.display = 'none';
  signedInEl.style.display = 'none';
  loadingEl.style.display = 'none';
  if (view === 'signed-out') signedOutEl.style.display = 'block';
  if (view === 'signed-in') signedInEl.style.display = 'block';
  if (view === 'loading') loadingEl.style.display = 'block';
}

// Check auth status on popup open
chrome.runtime.sendMessage({ action: 'getAuthStatus' }, (response) => {
  if (chrome.runtime.lastError || !response) {
    showView('signed-out');
    return;
  }

  if (response.signedIn) {
    userEmailEl.textContent = response.email || 'Signed in';
    showView('signed-in');
    loadMeetings();
  } else {
    showView('signed-out');
  }
});

signInBtn.addEventListener('click', () => {
  showView('loading');
  chrome.runtime.sendMessage({ action: 'signIn' }, (response) => {
    if (chrome.runtime.lastError || !response || !response.success) {
      showView('signed-out');
      return;
    }
    userEmailEl.textContent = response.email || 'Signed in';
    showView('signed-in');
    displayMeetings(response.meetings || []);
  });
});

signOutBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'signOut' }, () => {
    showView('signed-out');
  });
});

function loadMeetings() {
  chrome.runtime.sendMessage({ action: 'getMeetings' }, (response) => {
    if (chrome.runtime.lastError || !response) return;
    if (response.success) {
      displayMeetings(response.meetings || []);
    }
  });
}

function displayMeetings(meetings) {
  const timed = meetings.filter((m) => !m.isAllDay);

  if (timed.length === 0) {
    nextMeetingEl.style.display = 'none';
    noMeetingsEl.style.display = 'block';
    return;
  }

  const next = timed[0];
  nextTitleEl.textContent = next.title;

  const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
  const start = new Date(next.start).toLocaleTimeString([], opts);
  const end = next.end ? new Date(next.end).toLocaleTimeString([], opts) : '';
  nextTimeEl.textContent = end ? `${start} \u2013 ${end}` : start;

  nextMeetingEl.style.display = 'block';
  noMeetingsEl.style.display = 'none';
}
