import UrlJoin from "url-join";

import CreatorStudioIcon from "../../static/images/app_icons/Creator Studio.png";
import AnalyticsAndReportingIcon from "../../static/images/app_icons/Analytics and Reporting.png";
import FabricBrowserIcon from "../../static/images/app_icons/FabricBrowser.png";
import VideoEditorIcon from "../../static/images/app_icons/EVIE logo.png";
import SiteSampleIcon from "../../static/images/app_icons/site-sample.svg";
import StreamSampleIcon from "../../static/images/app_icons/stream-sample.svg";
import StudioIcon from "../../static/images/app_icons/Media Ingest.png";
import AISearchIcon from "../../static/images/app_icons/AI Clip Search - beta.png";
import ContentManagementIcon from "../../static/images/app_icons/Content Management - beta.png"
import LiveStreamManagerIcon from "../../static/images/app_icons/Livestream Manager.png";
import MediaPackagerIcon from "../../static/images/app_icons/Media Packager.png";

const icons = {
  "Fabric Browser": FabricBrowserIcon,
  "Video Intelligence Editor": VideoEditorIcon,
  "Site Sample": SiteSampleIcon,
  "Stream Sample": StreamSampleIcon,
  "Media Ingest": StudioIcon,
  "AI Content Search": AISearchIcon,
  "Content Management": ContentManagementIcon,
  "Livestream Manager": LiveStreamManagerIcon,
  "Media Packager": MediaPackagerIcon,
  "Creator Studio": CreatorStudioIcon,
  "Eluvio Studio": CreatorStudioIcon,
  "Analytics & Reporting": AnalyticsAndReportingIcon,
  "DApp Sample": SiteSampleIcon,
  "Cross-chain-auth Sample": SiteSampleIcon
};

const appNames = [
  "Fabric Browser", "Media Ingest", "Video Intelligence Editor", "Livestream Manager",
  "Creator Studio", "Eluvio Studio",
  "AI Content Search", "Content Management",
  "Analytics & Reporting", "Media Packager"
];

// Apps listed in EluvioConfiguration.appTenantAllowlist are only available to the listed tenants.
// Apps not listed there are available to everyone.
const tenantAllowlist = EluvioConfiguration.appTenantAllowlist || {};

export const IsAppRestricted = name => Array.isArray(tenantAllowlist[name]);

export const IsAppAllowed = (name, tenantContractId) =>
  !IsAppRestricted(name) ||
  (!!tenantContractId && tenantAllowlist[name].includes(tenantContractId));

export const FilterAllowedApps = (appList, tenantContractId) =>
  appList.filter(({name}) => IsAppAllowed(name, tenantContractId));

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
