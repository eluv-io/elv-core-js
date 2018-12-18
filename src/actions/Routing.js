export const SetAppLocation = ({location, newPath}) => {
  return async (dispatch) => {
    dispatch({
      type: "@@router/LOCATION_CHANGE",
      payload: {
        action: "PUSH",
        location: {
          ...location,
          pathname: newPath
        }
      }
    });
  };
};
