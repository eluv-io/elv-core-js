import React from "react";
import "../static/stylesheets/terms.scss";

import TermsDocument from "./TermsDocument.html";

class Terms extends React.Component {
  constructor(props) {
    super(props);

    const blob = new Blob([TermsDocument], {type: "text/html"});

    this.state = {
      termsUrl: window.URL.createObjectURL(blob)
    };
  }

  render() {
    return (
      <div className="terms-document-container">
        <h1>Eluvio Platform Services Agreement</h1>
        <iframe className="terms-document" src={this.state.termsUrl} />
      </div>
    );
  }
}

export default Terms;
