import React from "react";
import {ImageIcon} from "elv-components-js/src/components/Icons";
import TokenIcon from "../static/images/Token.png";

const Balance = ({balance, className}) => {
  if(!balance) { return null; }
  return (
    <span className={"account-balance " + className || ""}>
      <ImageIcon icon={TokenIcon} className="token-icon" label="Eluvio Token Icon"/>
      {balance}
    </span>
  );
};

export default Balance;
