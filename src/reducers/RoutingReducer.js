import ActionTypes from "../actions/ActionTypes";

const RoutingReducer = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.routing.showHeader:
      return {
        ...state,
        showHeader: true
      };

    case ActionTypes.routing.hideHeader:
      return {
        ...state,
        showHeader: false
      };

    default:
      return {
        showHeader: state.showHeader === undefined ? true : state.showHeader
      };
  }
};

export default RoutingReducer;
