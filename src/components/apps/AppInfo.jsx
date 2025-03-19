import UrlJoin from "url-join";

import CreatorStudioIcon from "../../static/images/app_icons/Creator Studio.png";
import AnalyticsAndReportingIcon from "../../static/images/app_icons/Analytics.png";
import FabricBrowserIcon from "../../static/images/app_icons/FabricBrowser.png";
import VideoEditorIcon from "../../static/images/app_icons/EVIE.png";
import SiteSampleIcon from "../../static/images/app_icons/Site Sample.png";
import StreamSampleIcon from "../../static/images/app_icons/Stream Sample.png";
import StudioIcon from "../../static/images/app_icons/Media Ingest.png";
import AISearchIcon from "../../static/images/app_icons/AI Search.png";
import LiveStreamManagerIcon from "../../static/images/app_icons/Livestream Manager.png";

export const appIcons = {
  "Fabric Browser": FabricBrowserIcon,
  "Video Editor": VideoEditorIcon,
  "Site Sample": SiteSampleIcon,
  "Stream Sample": StreamSampleIcon,
  "Media Ingest": StudioIcon,
  "AI Content Search": AISearchIcon,
  "Livestream Manager": LiveStreamManagerIcon,
  "Creator Studio": CreatorStudioIcon,
  "Eluvio Studio": CreatorStudioIcon,
  "Analytics and Reporting": AnalyticsAndReportingIcon,
  "Analytics & Reporting": AnalyticsAndReportingIcon
};

const appNames = [
  "Fabric Browser", "Media Ingest",  "Livestream Manager",
  "Creator Studio", "Eluvio Studio",
];

const suiteAppNames = [
  "AI Content Search", "Video Editor",
  "Analytics and Reporting", "Analytics & Reporting"
];

export default {
  apps: Object.keys(EluvioConfiguration.apps)
    .filter(name => appNames.find(appName => name.toLowerCase().includes(appName.toLowerCase())))
    .map(name => ({
      name,
      logo: appIcons[Object.keys(appIcons).find(key => name.includes(key))] || UrlJoin(EluvioConfiguration.apps[name], "Logo.png")
    })),
  suiteApps: Object.keys(EluvioConfiguration.apps)
    .filter(name => suiteAppNames.find(appName => name.toLowerCase().includes(appName.toLowerCase())))
    .map(name => ({
      name,
      logo: appIcons[Object.keys(appIcons).find(key => name.includes(key))] || UrlJoin(EluvioConfiguration.apps[name], "Logo.png")
    })),
  tools: Object.keys(EluvioConfiguration.apps)
    .filter(name => ![...appNames, ...suiteAppNames].find(appName => name.toLowerCase().includes(appName.toLowerCase())))
    .map(name => ({
      name,
      logo: appIcons[Object.keys(appIcons).find(key => name.includes(key))] || UrlJoin(EluvioConfiguration.apps[name], "Logo.png")
    }))
};
