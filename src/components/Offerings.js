import React from "react";
import "../static/stylesheets/offerings.scss";

import OfferingsTable from "./OfferingsTable";

class Offerings extends React.Component {
  render() {
    return (
      <div className="offerings-container">
        { OfferingsTable }
      </div>
    );
  }
}

export default Offerings;
