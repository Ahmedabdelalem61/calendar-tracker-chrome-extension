# Calendar Tracker - Chrome Extension

A Chrome extension that shows your upcoming Google Calendar meetings as a modern floating widget on every webpage. Never miss a meeting again.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Google Calendar API](https://img.shields.io/badge/Google%20Calendar-API-green)

## Features

- **Floating widget** on every webpage (bottom-right corner)
- **Live countdown** timers that update every second
- **Color-coded events**: green for ongoing, yellow for starting within 15 minutes
- **Join button** for Google Meet, Zoom, and Microsoft Teams links
- **Collapse/expand** between a compact card and a small icon with badge count
- **Auto-refresh** every 5 minutes
- **Glassmorphism design** with smooth animations
- **Shadow DOM** isolation — no CSS conflicts with any website

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **New Project** and give it a name (e.g., "Calendar Tracker")
3. Select the project

### 2. Enable the Google Calendar API

1. Go to **APIs & Services** > **Library**
2. Search for **Google Calendar API**
3. Click **Enable**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Click **Get Started** or **Configure**
3. Fill in:
   - **App name**: Calendar Tracker
   - **User support email**: your email
   - **Developer contact email**: your email
4. Set user type to **External**
5. Save and continue
6. Go to **Audience** > **Test users** > **Add users**
7. Add your Google email address

### 4. Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** > **OAuth Client ID**
3. Application type: **Chrome Extension**
4. Name: "Calendar Tracker"
5. **Don't fill in the Item ID yet** — you'll get it in step 6
6. Click **Create** and copy the **Client ID**

### 5. Configure the Extension

1. Clone this repository:
   ```bash
   git clone https://github.com/Ahmedabdelalem61/calendar-tracker-chrome-extension.git
   ```
2. Open `manifest.json`
3. Replace `YOUR_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID from step 4

### 6. Load the Extension in Chrome

1. Open `chrome://extensions/` in Chrome
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the cloned project folder
5. Copy the **Extension ID** shown under the extension name (a long string like `abcdefghijklmnop...`)

### 7. Link Extension ID to Google Cloud

1. Go back to [Google Cloud Console](https://console.cloud.google.com/) > **Credentials**
2. Click on your OAuth Client ID
3. In the **Application ID** / **Item ID** field, paste your Extension ID from step 6
4. Click **Save**

### 8. Sign In

1. Click the extension icon in Chrome's toolbar
2. Click **Sign in with Google**
3. If you see "Google hasn't verified this app", click **Continue**
4. Grant calendar access
5. The floating widget will now appear on every webpage

## Usage

### Expanded View
- Shows upcoming events with title, time range, and live countdown
- Click **Join** to open meeting links (Google Meet, Zoom, Teams)
- Scroll to see more events
- Click the **collapse button** (down arrow) to minimize

### Collapsed View
- Small calendar icon with a badge showing event count
- Badge turns **red and pulses** when a meeting starts within 15 minutes
- Click to expand

### Popup
- Click the extension icon for a quick view
- Shows sign-in status and next meeting
- Link to open Google Calendar

## Project Structure

```
├── manifest.json      # Manifest V3 configuration + OAuth2
├── background.js      # Service worker: OAuth, Calendar API, auto-refresh
├── content.js         # Floating widget (Shadow DOM) on every page
├── content.css        # Widget host positioning
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── popup.css          # Popup styles
└── icons/             # Extension icons (16, 48, 128px)
```

## Permissions

| Permission | Purpose |
|------------|---------|
| `identity` | Google OAuth2 sign-in |
| `alarms` | Auto-refresh meetings every 5 minutes |
| `storage` | Cache meetings and widget state |
| `activeTab` | Send meeting data to active tabs |
| `googleapis.com` | Fetch calendar events |

## License

MIT
