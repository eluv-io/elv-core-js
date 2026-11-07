const EluvioConfiguration = {
  "config-url": "https://main.net955305.contentfabric.io/config",
  "coreUrl": "http://localhost:8082",
  "apps": {
    "Eluvio Fabric Browser": "https://browse.v3.contentfabric.io",
    "Media Ingest": "https://studio.v3.contentfabric.io",
    "Video Editor": "https://video-editor.v3.contentfabric.io",
    "Stream Sample": "https://display.v3.contentfabric.io",
    "Site Sample": "https://site-sample.v3.contentfabric.io",
    "AI Content Search": "https://eluvio-clip-search.web.app",
    "Livestream Manager": "https://eluvio-live-stream-v3.web.app",
    "Media Packager": "http://localhost:3006"
  },
  // Restrict apps to specific tenants: {"<app name>": ["iten..."]}. Unlisted apps are available to all tenants.
  "appTenantAllowlist": {
    "Media Packager": ["iten..."]
  },
  "version": "local"
};

