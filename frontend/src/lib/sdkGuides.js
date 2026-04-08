const withPlaceholderHeader = (text) =>
  `// Replace YOUR_API_KEY with your project's API key.\n// The raw API key is only shown once when the project is created.\n\n${text}`;

const DEFAULT_BACKEND_BASE_URL = "http://localhost:3000";

const normalizeBaseUrl = (baseUrl) =>
  (baseUrl || DEFAULT_BACKEND_BASE_URL).trim().replace(/\/+$/, "");

export const buildIngestEndpoint = (baseUrl) => {
  const normalized = normalizeBaseUrl(baseUrl);
  return normalized.endsWith("/api/ingest/event")
    ? normalized
    : `${normalized}/api/ingest/event`;
};

export const getDownloadFilename = (filename = "pulseiq-sdk.txt") =>
  filename.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-");

export const SDK_PLATFORMS = [
  { id: "html", label: "HTML / JS", badge: "WEB" },
  { id: "websdk", label: "NPM Package SDK", badge: "PACKAGE" },
  { id: "react", label: "React / Vite", badge: "WEB" },
  { id: "nextjs", label: "Next.js", badge: "WEB" },
  { id: "vue", label: "Vue", badge: "WEB" },
  { id: "angular", label: "Angular", badge: "WEB" },
  { id: "mern", label: "MERN / Node", badge: "FULLSTACK" },
  { id: "wordpress", label: "WordPress", badge: "CMS" },
  { id: "reactnative", label: "React Native", badge: "APP" },
  { id: "flutter", label: "Flutter", badge: "APP" },
];

export const getSdkGuide = ({ platform = "html", apiKey = "YOUR_API_KEY", projectId, endpoint }) => {
  const ingestEndpoint = buildIngestEndpoint(endpoint);
  const credentialsNote = apiKey === "YOUR_API_KEY" ? "YOUR_API_KEY" : apiKey;

  const guides = {
    html: {
      id: "html",
      label: "HTML / JS",
      filename: "pulseiq-sdk.js",
      paste: "Paste this script before the closing </body> tag in your HTML file.",
      placement: "Best place: root HTML file, landing page HTML, or template footer.",
      tips: [
        "This snippet auto-sends page_view when the page loads.",
        "Call PulseIQ.track for custom events like signup_click, purchase, form_submit.",
        "Call PulseIQ.identify after login to attach future events to a real user id.",
      ],
      code: withPlaceholderHeader(`<!-- PulseIQ Analytics SDK -->
<script>
(function() {
  var PulseIQ = {
    apiKey: "${credentialsNote}",
    projectId: "${projectId}",
    endpoint: "${ingestEndpoint}",
    getAnonId: function() {
      var id = localStorage.getItem("_piq_anon");
      if (!id) {
        id = "anon_" + Math.random().toString(36).slice(2, 11);
        localStorage.setItem("_piq_anon", id);
      }
      return id;
    },
    getSessionId: function() {
      var id = sessionStorage.getItem("_piq_session");
      if (!id) {
        id = "sess_" + Math.random().toString(36).slice(2, 11);
        sessionStorage.setItem("_piq_session", id);
      }
      return id;
    },
    track: function(eventName, properties) {
      fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        body: JSON.stringify({
          projectId: this.projectId,
          eventName: eventName,
          sessionId: this.getSessionId(),
          userId: localStorage.getItem("_piq_user") || undefined,
          anonymousId: this.getAnonId(),
          properties: Object.assign({
            page: window.location.pathname,
            referrer: document.referrer
          }, properties || {})
        })
      }).catch(function() {});
    },
    identify: function(userId) {
      localStorage.setItem("_piq_user", String(userId));
      this.track("identify", { userId: userId });
    }
  };

  window.PulseIQ = PulseIQ;
  PulseIQ.track("page_view");
})();
</script>

<!-- Example usage -->
<!-- <button onclick="PulseIQ.track('button_click', { id: 'hero_cta' })">Start</button> -->`),
    },
    websdk: {
      id: "websdk",
      label: "NPM Package SDK",
      filename: "pulseiq-web-setup.txt",
      paste: "Install the package, create a shared PulseIQ client file, then import it anywhere in your app.",
      placement: "Best place: install from npm or from this repo's local packages/pulseiq-web folder.",
      tips: [
        "Use npm install pulseiq-web when published, or npm install file:../packages/pulseiq-web for local testing.",
        "Works well for React, Next.js, Vue, Angular, and plain JS apps that use a bundler.",
        "Use client.page() for route changes and client.track() for custom events.",
      ],
      code: `# Install from npm
npm install pulseiq-web

# Or install locally from this repo
npm install file:../packages/pulseiq-web

// src/lib/pulseiq-client.js
import { createPulseIQ } from "pulseiq-web";

export const pulseiq = createPulseIQ({
  apiKey: "${credentialsNote}",
  projectId: "${projectId}",
  endpoint: "${ingestEndpoint}",
  autoTrackPageViews: false,
  autoTrackClicks: true,
  autoTrackScroll: true,
});

// route-change example
// pulseiq.page({ path: window.location.pathname });

// custom event example
// pulseiq.track("signup_click", { plan: "pro" });

// after login
// pulseiq.identify(user.id);

// after logout
// pulseiq.resetIdentity();`,
    },
    react: {
      id: "react",
      label: "React / Vite",
      filename: "src/lib/pulseiq.js",
      paste: "Create src/lib/pulseiq.js, then import it in your App or page components.",
      placement: "Best place: shared lib folder + App.jsx / router-level useEffect.",
      tips: [
        "Track route changes from React Router using useLocation.",
        "Call attachPulseIQAutoTracking once in App.jsx if you want click + scroll signals.",
        "Call identify after login/signup success.",
      ],
      code: withPlaceholderHeader(`const CONFIG = {
  apiKey: "${credentialsNote}",
  projectId: "${projectId}",
  endpoint: "${ingestEndpoint}",
};

function getAnonId() {
  let id = localStorage.getItem("_piq_anon");
  if (!id) {
    id = "anon_" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem("_piq_anon", id);
  }
  return id;
}

function getSessionId() {
  let id = sessionStorage.getItem("_piq_session");
  if (!id) {
    id = "sess_" + Math.random().toString(36).slice(2, 11);
    sessionStorage.setItem("_piq_session", id);
  }
  return id;
}

export function track(eventName, properties = {}) {
  fetch(CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CONFIG.apiKey,
    },
    body: JSON.stringify({
      projectId: CONFIG.projectId,
      eventName,
      sessionId: getSessionId(),
      userId: localStorage.getItem("_piq_user") || undefined,
      anonymousId: getAnonId(),
      properties: {
        page: window.location.pathname,
        ...properties,
      },
    }),
  }).catch(() => {});
}

export function identify(userId) {
  localStorage.setItem("_piq_user", String(userId));
  track("identify", { userId });
}

export function attachPulseIQAutoTracking() {
  window.addEventListener("click", (event) => {
    track("button_click", {
      x: event.clientX,
      y: event.clientY,
      tag: event.target?.tagName || "unknown",
      text: (event.target?.innerText || "").slice(0, 80),
    });
  });
}

// App.jsx example
// import { useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { track, attachPulseIQAutoTracking } from "./lib/pulseiq";
//
// const location = useLocation();
// useEffect(() => { track("page_view", { path: location.pathname }); }, [location.pathname]);
// useEffect(() => { attachPulseIQAutoTracking(); }, []);`),
    },
    nextjs: {
      id: "nextjs",
      label: "Next.js",
      filename: "src/lib/pulseiq.ts",
      paste: "Create src/lib/pulseiq.ts, then call it from a client component or root layout.",
      placement: "Best place: app/layout.tsx or a client analytics provider.",
      tips: [
        "Use 'use client' in the component that tracks route changes.",
        "Call track inside useEffect whenever pathname changes.",
        "Works with both App Router and Pages Router.",
      ],
      code: withPlaceholderHeader(`export const pulseiqConfig = {
  apiKey: "${credentialsNote}",
  projectId: "${projectId}",
  endpoint: "${ingestEndpoint}",
};

function getAnonId() {
  const existing = window.localStorage.getItem("_piq_anon");
  if (existing) return existing;
  const next = "anon_" + Math.random().toString(36).slice(2, 11);
  window.localStorage.setItem("_piq_anon", next);
  return next;
}

export async function track(eventName: string, properties: Record<string, unknown> = {}) {
  try {
    await fetch(pulseiqConfig.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": pulseiqConfig.apiKey,
      },
      body: JSON.stringify({
        projectId: pulseiqConfig.projectId,
        eventName,
        userId: window.localStorage.getItem("_piq_user") || undefined,
        anonymousId: getAnonId(),
        properties: {
          page: window.location.pathname,
          ...properties,
        },
      }),
    });
  } catch {}
}

export function identify(userId: string) {
  window.localStorage.setItem("_piq_user", userId);
  track("identify", { userId });
}

// app/pulseiq-provider.tsx
// "use client";
// import { useEffect } from "react";
// import { usePathname } from "next/navigation";
// import { track } from "@/lib/pulseiq";
//
// export function PulseIQProvider() {
//   const pathname = usePathname();
//   useEffect(() => {
//     track("page_view", { path: pathname });
//   }, [pathname]);
//   return null;
// }`),
    },
    vue: {
      id: "vue",
      label: "Vue",
      filename: "src/lib/pulseiq.js",
      paste: "Create src/lib/pulseiq.js and call it from router.afterEach or mounted hooks.",
      placement: "Best place: lib folder + router/index.js for page_view events.",
      tips: [
        "Use router.afterEach for page tracking.",
        "Use track inside click handlers for CTA events.",
        "Call identify after successful auth.",
      ],
      code: withPlaceholderHeader(`const CONFIG = {
  apiKey: "${credentialsNote}",
  projectId: "${projectId}",
  endpoint: "${ingestEndpoint}",
};

function getAnonId() {
  let id = localStorage.getItem("_piq_anon");
  if (!id) {
    id = "anon_" + Math.random().toString(36).slice(2, 11);
    localStorage.setItem("_piq_anon", id);
  }
  return id;
}

export function track(eventName, properties = {}) {
  fetch(CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CONFIG.apiKey,
    },
    body: JSON.stringify({
      projectId: CONFIG.projectId,
      eventName,
      userId: localStorage.getItem("_piq_user") || undefined,
      anonymousId: getAnonId(),
      properties: { page: window.location.pathname, ...properties },
    }),
  }).catch(() => {});
}

export function identify(userId) {
  localStorage.setItem("_piq_user", String(userId));
  track("identify", { userId });
}

// router/index.js example
// router.afterEach((to) => {
//   track("page_view", { path: to.fullPath });
// });`),
    },
    angular: {
      id: "angular",
      label: "Angular",
      filename: "src/app/services/pulseiq.service.ts",
      paste: "Create a service and call it from app.component.ts or Router events.",
      placement: "Best place: Angular service + router.events subscription.",
      tips: [
        "Subscribe to NavigationEnd for page tracking.",
        "Inject the service into components for custom event calls.",
        "Use identify after auth response.",
      ],
      code: withPlaceholderHeader(`import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class PulseIQService {
  private apiKey = "${credentialsNote}";
  private projectId = "${projectId}";
  private endpoint = "${ingestEndpoint}";

  private getAnonId() {
    let id = localStorage.getItem("_piq_anon");
    if (!id) {
      id = "anon_" + Math.random().toString(36).slice(2, 11);
      localStorage.setItem("_piq_anon", id);
    }
    return id;
  }

  track(eventName: string, properties: Record<string, unknown> = {}) {
    fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        projectId: this.projectId,
        eventName,
        userId: localStorage.getItem("_piq_user") || undefined,
        anonymousId: this.getAnonId(),
        properties: {
          page: window.location.pathname,
          ...properties,
        },
      }),
    }).catch(() => {});
  }

  identify(userId: string) {
    localStorage.setItem("_piq_user", userId);
    this.track("identify", { userId });
  }
}

// app.component.ts
// this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
//   this.pulseIQ.track("page_view");
// });`),
    },
    mern: {
      id: "mern",
      label: "MERN / Node",
      filename: "pulseiq.js",
      paste: "Use the React guide for frontend and this helper for server-side events.",
      placement: "Best place: backend utils folder, service layer, or Express routes.",
      tips: [
        "Use this for server-side events like user_registered, invoice_paid, plan_upgraded.",
        "Frontend page_view and button click events should still use the React snippet.",
        "Node 18+ has fetch built in. For older Node versions add node-fetch.",
      ],
      code: withPlaceholderHeader(`const PULSEIQ_API_KEY = "${credentialsNote}";
const PULSEIQ_PROJECT_ID = "${projectId}";
const PULSEIQ_ENDPOINT = "${ingestEndpoint}";

async function track(eventName, userId = null, properties = {}) {
  try {
    await fetch(PULSEIQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": PULSEIQ_API_KEY,
      },
      body: JSON.stringify({
        projectId: PULSEIQ_PROJECT_ID,
        eventName,
        userId: userId || undefined,
        anonymousId: "server_event",
        properties,
      }),
    });
  } catch {}
}

module.exports = { track };

// Example
// await track("user_registered", newUser._id, { email: newUser.email });
// await track("payment_success", req.user._id, { amount: order.total });`),
    },
    wordpress: {
      id: "wordpress",
      label: "WordPress",
      filename: "functions.php",
      paste: "Paste this at the bottom of functions.php or add it through the Code Snippets plugin.",
      placement: "Best place: active theme footer injection or Code Snippets plugin.",
      tips: [
        "Safer option: use the Code Snippets plugin instead of editing theme files directly.",
        "This snippet auto-tracks page_view for each page load.",
        "Logged-in WordPress users can be sent as userId automatically.",
      ],
      code: withPlaceholderHeader(`<?php
function pulseiq_analytics_script() { ?>
<script>
(function() {
  var PulseIQ = {
    apiKey: "<?php echo esc_js("${credentialsNote}"); ?>",
    projectId: "<?php echo esc_js("${projectId}"); ?>",
    endpoint: "<?php echo esc_js("${ingestEndpoint}"); ?>",
    getAnonId: function() {
      var id = localStorage.getItem("_piq_anon");
      if (!id) {
        id = "anon_" + Math.random().toString(36).slice(2, 11);
        localStorage.setItem("_piq_anon", id);
      }
      return id;
    },
    track: function(eventName, properties) {
      fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        body: JSON.stringify({
          projectId: this.projectId,
          eventName: eventName,
          userId: <?php echo is_user_logged_in() ? '"' . get_current_user_id() . '"' : 'undefined'; ?>,
          anonymousId: this.getAnonId(),
          properties: Object.assign({ page: location.pathname, title: document.title }, properties || {})
        })
      }).catch(function() {});
    }
  };

  window.PulseIQ = PulseIQ;
  PulseIQ.track("page_view");
})();
</script>
<?php }

add_action("wp_footer", "pulseiq_analytics_script");`),
    },
    reactnative: {
      id: "reactnative",
      label: "React Native",
      filename: "src/lib/pulseiq.js",
      paste: "Create src/lib/pulseiq.js and import it in your screens or navigation container.",
      placement: "Best place: shared lib folder + useFocusEffect / navigation listener.",
      tips: [
        "Install @react-native-async-storage/async-storage first.",
        "Track screen_view whenever a new screen becomes active.",
        "Use identify after login to link events with the signed-in user.",
      ],
      code: withPlaceholderHeader(`import AsyncStorage from "@react-native-async-storage/async-storage";

const CONFIG = {
  apiKey: "${credentialsNote}",
  projectId: "${projectId}",
  endpoint: "${ingestEndpoint}",
};

async function getAnonId() {
  let id = await AsyncStorage.getItem("_piq_anon");
  if (!id) {
    id = "anon_" + Math.random().toString(36).slice(2, 11);
    await AsyncStorage.setItem("_piq_anon", id);
  }
  return id;
}

export async function track(eventName, properties = {}) {
  try {
    const [anonId, userId] = await Promise.all([
      getAnonId(),
      AsyncStorage.getItem("_piq_user"),
    ]);

    await fetch(CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CONFIG.apiKey,
      },
      body: JSON.stringify({
        projectId: CONFIG.projectId,
        eventName,
        userId: userId || undefined,
        anonymousId: anonId,
        properties,
      }),
    });
  } catch {}
}

export async function identify(userId) {
  await AsyncStorage.setItem("_piq_user", String(userId));
  await track("identify", { userId });
}

// Screen example
// useFocusEffect(() => {
//   track("screen_view", { screen: "Home" });
// });`),
    },
    flutter: {
      id: "flutter",
      label: "Flutter",
      filename: "lib/services/pulseiq_service.dart",
      paste: "Create lib/services/pulseiq_service.dart and call it from initState or navigation observers.",
      placement: "Best place: shared service class + Navigator observer.",
      tips: [
        "Add http and shared_preferences packages.",
        "Track screen_view from page initState or route observer.",
        "Call identify after login/signup completes.",
      ],
      code: withPlaceholderHeader(`import "dart:convert";
import "dart:math";
import "package:http/http.dart" as http;
import "package:shared_preferences/shared_preferences.dart";

class PulseIQService {
  static const apiKey = "${credentialsNote}";
  static const projectId = "${projectId}";
  static const endpoint = "${ingestEndpoint}";

  static Future<String> _getAnonId() async {
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getString("_piq_anon");
    if (existing != null) return existing;
    final next = "anon_\${Random().nextInt(99999999)}";
    await prefs.setString("_piq_anon", next);
    return next;
  }

  static Future<void> track(String eventName, Map<String, dynamic> properties) async {
    final prefs = await SharedPreferences.getInstance();
    final anonId = await _getAnonId();
    final userId = prefs.getString("_piq_user");

    await http.post(
      Uri.parse(endpoint),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: jsonEncode({
        "projectId": projectId,
        "eventName": eventName,
        "userId": userId,
        "anonymousId": anonId,
        "properties": properties,
      }),
    );
  }

  static Future<void> identify(String userId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString("_piq_user", userId);
    await track("identify", { "userId": userId });
  }
}`),
    },
  };

  return guides[platform] || guides.html;
};

export const getSdkQuickStartSteps = () => [
  {
    id: "project",
    title: "Create project",
    description: "Organizer creates a project and copies the API key, project id, and endpoint.",
  },
  {
    id: "install",
    title: "Paste SDK",
    description: "Choose your framework and paste the ready-made PulseIQ snippet in the correct file.",
  },
  {
    id: "verify",
    title: "Verify events",
    description: "Refresh the app/site so page_view fires, then verify from the PulseIQ dashboard.",
  },
];

export const getEnvTemplate = ({ apiKey, projectId, endpoint, projectName }) => `# PulseIQ Analytics
# Project: ${projectName}
# Generated: ${new Date().toLocaleString()}
#
# Do not commit this file to git.
# Update the endpoint after production deployment if needed.

PULSEIQ_API_KEY=${apiKey}
PULSEIQ_PROJECT_ID=${projectId}
PULSEIQ_ENDPOINT=${buildIngestEndpoint(endpoint)}

VITE_PULSEIQ_API_KEY=${apiKey}
VITE_PULSEIQ_PROJECT_ID=${projectId}
VITE_PULSEIQ_ENDPOINT=${buildIngestEndpoint(endpoint)}
`;

export const getMinimalHtmlSnippet = (endpoint) => `<!-- Paste before </body> -->
<script>
(function() {
  var PulseIQ = {
    apiKey: "YOUR_API_KEY",
    projectId: "YOUR_PROJECT_ID",
    endpoint: "${buildIngestEndpoint(endpoint)}",
    track: function(eventName, properties) {
      fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey
        },
        body: JSON.stringify({
          projectId: this.projectId,
          eventName: eventName,
          anonymousId: localStorage.getItem("_piq_anon") || "anon_" + Math.random().toString(36).slice(2),
          properties: Object.assign({ page: location.pathname }, properties || {})
        })
      }).catch(function() {});
    }
  };

  window.PulseIQ = PulseIQ;
  PulseIQ.track("page_view");
})();
</script>`;
