import ActionTypes from "./ActionTypes";
import Id from "../utils/Id";
import {SetErrorMessage} from "./Notifications";

// Wrap actions with requests to keep request state updated automatically
// Returns a unique ID corresponding to the request state
export const WrapRequest = ({
  dispatch,
  action,
  todo
}) => {
  let requestId = Id.next();

  Request({
    requestId,
    dispatch,
    action,
    todo
  });

  return requestId;
};

const Request = async ({
  requestId,
  dispatch,
  action,
  todo
}) => {
  dispatch(RequestSubmitted(requestId, action));

  try {
    await todo();

    dispatch(RequestCompleted(requestId, action));
  } catch(error) {
    console.error(error);
    let errorMessage = error;

    if(typeof error !== "string") {
      // Error object -- actual message may be present in one of several different keys
      errorMessage = error.message ||
        error.statusText ||
        (error.responseText && JSON.parse(error.responseText).error.message) ||
        error;
    }

    dispatch(RequestError(requestId, action, errorMessage));
    dispatch(SetErrorMessage({message: errorMessage}));
  }
};

const RequestSubmitted = (requestId, action) => {
  return {
    type: ActionTypes.requests.submitted,
    requestId: requestId,
    action: action
  };
};

const RequestCompleted = (requestId, action) => {
  return {
    type: ActionTypes.requests.completed,
    requestId: requestId,
    action: action
  };
};

const RequestError = (requestId, action, error_message) => {
  return {
    type: ActionTypes.requests.error,
    requestId: requestId,
    action: action,
    error_message: error_message
  };
};
