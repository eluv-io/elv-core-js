import ActionTypes from "../actions/ActionTypes";

const RequestsReducer = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.requests.submitted:
      return {
        ...state,
        [action.requestId]: {
          action: action.action,
          updatedAt: Date.now(),
          pending: true,
          completed: false,
          error: false
        }
      };

    case ActionTypes.requests.completed:
      return {
        ...state,
        [action.requestId]: {
          action: action.action,
          updatedAt: Date.now(),
          pending: false,
          completed: true,
          error: false,
        }
      };

    case ActionTypes.requests.error:
      return {
        ...state,
        [action.requestId]: {
          action: action.action,
          updatedAt: Date.now(),
          pending: false,
          completed: false,
          error: true,
          error_message: action.error_message
        }
      };

    default:
      return {
        ...state,
      };
  }
};

export default RequestsReducer;
