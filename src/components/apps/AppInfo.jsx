import UrlJoin from "url-join";

import CreatorStudioIcon from "../../static/images/app_icons/Creator Studio.png";
import AnalyticsAndReportingIcon from "../../static/images/app_icons/Analytics and Reporting.png";
import FabricBrowserIcon from "../../static/images/app_icons/FabricBrowser.png";
import VideoEditorIcon from "../../static/images/app_icons/EVIE logo.png";
import SiteSampleIcon from "../../static/images/app_icons/site-sample.svg";
import StreamSampleIcon from "../../static/images/app_icons/stream-sample.svg";
import StudioIcon from "../../static/images/app_icons/Media Ingest.png";
import AISearchIcon from "../../static/images/app_icons/AI Clip Search - beta.png";
import LiveStreamManagerIcon from "../../static/images/app_icons/Livestream Manager.png";

const icons = {
  "Fabric Browser": FabricBrowserIcon,
  "Video Intelligence Editor": VideoEditorIcon,
  "Site Sample": SiteSampleIcon,
  "Stream Sample": StreamSampleIcon,
  "Media Ingest": StudioIcon,
  "AI Content Search": AISearchIcon,
  "Livestream Manager": LiveStreamManagerIcon,
  "Creator Studio": CreatorStudioIcon,
  "Eluvio Studio": CreatorStudioIcon,
  "Analytics & Reporting": AnalyticsAndReportingIcon,
  "DApp Sample": SiteSampleIcon,
  "Cross-chain-auth Sample": SiteSampleIcon
};

const appNames = [
  "Fabric Browser", "Media Ingest", "Video Intelligence Editor", "Livestream Manager",
  "Creator Studio", "Eluvio Studio",
  "AI Content Search",
  "Analytics & Reporting"
];

export default {
  apps: Object.keys(EluvioConfiguration.apps)
    .filter(name => appNames.find(appName => name.toLowerCase().includes(appName.toLowerCase()) && !name.toLowerCase().includes("experiment")))
    .map(name => ({
      name,
      logo: icons[Object.keys(icons).find(key => name.includes(key))] || UrlJoin(EluvioConfiguration.apps[name], "Logo.png")
    })),
  tools: Object.keys(EluvioConfiguration.apps)
    .filter(name => !appNames.find(appName => name.toLowerCase().includes(appName.toLowerCase())))
    .map(name => ({
      name,
      logo: icons[Object.keys(icons).find(key => name.includes(key))] || UrlJoin(EluvioConfiguration.apps[name], "Logo.png")
    })),
  experiments: Object.keys(EluvioConfiguration.apps)
    .filter(name => appNames.find(appName => name.toLowerCase().includes("experiment")))
    .map(name => ({
      name,
      logo: icons[Object.keys(icons).find(key => name.includes(key))] || UrlJoin(EluvioConfiguration.apps[name], "Logo.png")
    }))
};
