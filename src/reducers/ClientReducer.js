import ActionTypes from "../actions/ActionTypes";
import {ElvClient} from "elv-client-js/src/ElvClient";

const InitializeClient = (signer) => {
  const client = ElvClient.FromConfiguration({configuration: require("../../configuration.json")});

  if(signer) {
    client.SetSigner({signer});
  }

  return client;
};

const ClientReducer = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.client.setSigner:
      return {
        ...state,
        client: InitializeClient(action.signer)
      };

    case ActionTypes.client.clearSigner:
      return {
        ...state,
        client: InitializeClient()
      };

    default:
      return {
        ...state,
        client: state.client || InitializeClient()
      };
  }
};

export default ClientReducer;



