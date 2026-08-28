# Google Drive CSV import — setup

"Import CSV" can pull a file from Google Drive using Google's own file-picker
UI. This needs one more manual step in Google Cloud Console beyond the
existing OAuth Client ID (`VITE_GOOGLE_CLIENT_ID`) used for sign-in.

## 1. Enable the Google Picker API

**APIs & Services → Library** → search "Google Picker API" → **Enable**.
(This is separate from the "Google Drive API" — the Picker API powers the
file-browser popup itself; the Drive API, already used elsewhere, is what
actually fetches the picked file's content.)

## 2. Create an API key

**APIs & Services → Credentials → Create Credentials → API key**.

This is a *different* kind of credential from the OAuth Client ID — it's a
public key that identifies your app to Google's Picker widget, not a secret
used for authorization. Google still recommends restricting it:

- **API restrictions**: restrict the key to just "Google Picker API".
- **Application restrictions**: restrict to your app's origins (HTTP
  referrers), e.g. `http://localhost:5173/*`, plus any production domain
  once one exists.

## 3. Wire it into the app

Add the key to `.env.local`:

```
VITE_GOOGLE_PICKER_API_KEY=your-api-key-here
```

Restart `npm run dev` after adding/changing it.

## How it works

Clicking "Import from Google Drive" requests a Drive access token scoped to
`drive.file` — the narrowest Drive scope, which only grants access to files
the user explicitly picks in that session, not their whole Drive. It then
opens Google's Picker UI (filtered to CSV/plain-text files); once a file is
picked, its content is fetched via the Drive REST API and parsed the same
way a local CSV upload is.
