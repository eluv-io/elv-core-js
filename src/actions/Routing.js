import Path from "path";

export const GetAppLocation = ({basePath}) => {
  return window.location.hash.replace(`#${basePath}`, "") || "/";
};

export const SetAppLocation = ({basePath, appPath}) => {
  // Replace app URL in hash without breaking history
  history.replaceState(null, null, `#${Path.join(basePath, appPath)}`);
};
