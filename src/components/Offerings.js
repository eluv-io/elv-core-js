import React from "react";
import "../static/stylesheets/offerings.scss";

import OfferingsTable from "./OfferingsTable";

class Offerings extends React.Component {
  ServicePolicies() {

    return (
      <div className="service-container">
        <h1>Customer Service and Support</h1>
        <p>
          Eluvio strives to provide the highest quality content streaming and delivery experience and an always-available service.
          All platform availability/service degraded issues are resolved with continuous highest priority according to the SLAs in the Eluvio Platform Services Agreement.
          Streaming quality means high picture quality, streaming at the maximum currently available bandwidth of the end client, and negligible rebuffering.
        </p>

        <div className="offerings service-offerings">
          <div className="offering-row offering-row-section-header no-border">
            <div className="">
              Standard Customer Service
            </div>
          </div>
          <div className="offering-row offering-row-odd">
            <div className=" offering-detail">
              &nbsp;&nbsp; Provided M-F 8AM-6PM Pacific
            </div>
          </div>
          <div className="offering-row offering-row-even">
            <div className=" offering-detail">
              &nbsp;&nbsp; Email via support@eluv.io
            </div>
          </div>
          <div className="offering-row offering-row-odd">
            <div className=" offering-detail">
              &nbsp;&nbsp; Telephone via Google Voice
            </div>
          </div>
          <div className="offering-row offering-row-section-header">
            <div className="">
              Priority Customer Service (Tier 1)
            </div>
          </div>
          <div className="offering-row offering-row-odd">
            <div className=" offering-detail">
              &nbsp;&nbsp; Provided 24x7x365
            </div>
          </div>
          <div className="offering-row offering-row-even">
            <div className=" offering-detail">
              &nbsp;&nbsp; Dedicated slack channel
            </div>
          </div>
          <div className="offering-row offering-row-odd">
            <div className=" offering-detail">
              &nbsp;&nbsp; Telephone via Google Voice with Paging
            </div>
          </div>
          <div className="offering-row offering-row-even">
            <div className=" offering-detail">
              &nbsp;&nbsp; Guaranteed 2-hour initial response on customer specific trouble tickets
            </div>
          </div>
          <div className="offering-row offering-row-odd">
            <div className=" offering-detail">
              &nbsp;&nbsp; Best effort same day resolution on high severity issues
            </div>
          </div>
          <div className="offering-row offering-row-even">
            <div className=" offering-detail">
              &nbsp;&nbsp; Best effort next day resolution on medium severity issues
            </div>
          </div>
          <div className="offering-row offering-row-odd">
            <div className=" offering-detail">
              &nbsp;&nbsp; Priority early access to new capabilities and roadmap review
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="note">
          * A Viewable Hour is the sum of all playable minutes of content streamed or downloaded from Active Primary Titles by all end users divided by 60 (minutes per hour).
        </div>

        { this.ServicePolicies() }
      </div>
    );
  }
}

export default Offerings;
