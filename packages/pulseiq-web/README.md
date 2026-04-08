# pulseiq-web

Browser SDK for sending PulseIQ analytics events.

## Install

```bash
npm install pulseiq-web
```

Or from this repo locally:

```bash
npm install file:../packages/pulseiq-web
```

## Usage

```js
import { createPulseIQ } from "pulseiq-web";

const pulseiq = createPulseIQ({
  apiKey: "YOUR_API_KEY",
  projectId: "YOUR_PROJECT_ID",
  endpoint: "https://your-backend.com/api/ingest/event",
  autoTrackPageViews: false,
  autoTrackClicks: true,
  autoTrackScroll: true,
});

pulseiq.page();
pulseiq.track("signup_click", { plan: "pro" });
pulseiq.identify("user_123");
```

## API

- `track(eventName, properties)`
- `page(properties)`
- `identify(userId, traits)`
- `resetIdentity()`
- `attachAutoTracking({ click, scroll })`
- `start()`
- `stop()`
