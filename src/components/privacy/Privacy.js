import React from "react";
import "../../static/stylesheets/terms.scss";

import TermsDocument from "./PrivacyPolicy.html";

class Privacy extends React.Component {
  constructor(props) {
    super(props);

    const blob = new Blob([TermsDocument], {type: "text/html"});

    this.state = {
      privacyUrl: window.URL.createObjectURL(blob)
    };
  }

  render() {
    return (
      <div className="terms-document-container">
        <h1>Eluvio, Inc Privacy Policy</h1>
        <iframe className="terms-document" src={this.state.privacyUrl} />
      </div>
    );
  }
}

export default Privacy;
