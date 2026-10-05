const EluvioConfiguration = {
  "config-url": "https://main.net955305.contentfabric.io/config",
  //"config-url": "https://demov3.net955210.contentfabric.io/config",
  "apps": {
    "Eluvio Fabric Browser": "http://localhost:8080",
    "Media Ingest": "http://localhost:8110",
    "Livestream Manager": "http://localhost:8155",
    "Creator Studio": "http://localhost:9000",
    "Video Intelligence Editor": "http://localhost:8083",
    "AI Content Search": "http://localhost:3001",
    "Analytics & Reporting": "http://localhost:3000",
    "Content Management": "http://localhost:3003",
    "Media Packager": "http://localhost:3006",
    "Stream Sample": "http://localhost:8084",
    "Site Sample": "http://localhost:8086",
    "DApp Sample": "https://dapp-sample.app.eluv.io/",
    "Cross-chain-auth Sample": "https://dapp-sample-xco.app.eluv.io/?network=demo"
  },
  // Restrict apps to specific tenants: {"<app name>": ["iten..."]}. Unlisted apps are available to all tenants.
  "appTenantAllowlist": {
    "Media Packager": ["iten2Cfqbvd4SL9QApyewGMoqBtEvGzY"]
  },
  "ory_configuration": {
    "url": "http://localhost:3000",
    "jwt_template": "jwt_uefa_template1"
  },
  "version": "local"
};
