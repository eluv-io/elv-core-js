import Path from "path";
import ActionTypes from "./ActionTypes";

export const GetAppLocation = ({basePath}) => {
  return window.location.hash.replace(`#${basePath}`, "") || "/";
};

export const SetAppLocation = ({basePath, appPath}) => {
  // Replace app URL in hash without breaking history
  history.replaceState(null, null, `#${Path.join(basePath, appPath)}`);
};

export const ShowHeader = () => {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.routing.showHeader
    });
  };
};

export const HideHeader = () => {
  return (dispatch) => {
    dispatch({
      type: ActionTypes.routing.hideHeader
    });
  };
};
