import React from "react";
import "../static/stylesheets/offerings.scss";

import OfferingsTable from "./OfferingsTable";

class Offerings extends React.Component {
  render() {
    return (
      <div className="offerings-container">
        { OfferingsTable }
        <div className="note">
          * An Active Title is a primary title content object that receives media playback or download requests (other than listing public metdata) and/or is updated at least once within the billing month.
        </div>
        <div className="note">
          * An Inactive Title is a primary title content object that does not receive any media playback or download requests (other than listing public metadata) and is not updated for the duration of the billing month.
        </div>
      </div>
    );
  }
}

export default Offerings;
