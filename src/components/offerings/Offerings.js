import React from "react";
import "../../static/stylesheets/offerings.scss";

import OfferingsTable from "./OfferingsTable";
import {ImageIcon} from "elv-components-js";
import CheckIcon from "../../static/icons/Check.svg";

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

        <div className="offerings">
          <div className="offering-row offering-row-header">
            <div className=" offering-nocheck offerings-cell-left">
              Technical Support & Service Policies for Tenants
            </div>
            <div className="offerings-cell-centered">
              Level 1
            </div>
            <div className="offerings-cell-centered">
              Level 2
            </div>
            <div className="offerings-cell-centered">
              Level 3
            </div>
          </div>
          <div className="offering-row offering-row-odd">
            <div className=" offering-detail">
              &nbsp;&nbsp; 24x7 Platform Monitoring with Service Credits per Agreement
            </div>
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
          </div>
          <div className="offering-row offering-row-even">
            <div className=" offering-detail">
              &nbsp;&nbsp; Standard Customer Service (Email)
            </div>
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
          </div>
          <div className="offering-row offering-row-odd">
            <div className=" offering-detail">
              &nbsp;&nbsp; Standard Customer Service (Email, Telephone)
            </div>
            <div className=" offering-nocheck" />
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
          </div>
          <div className="offering-row offering-row-even">
            <div className=" offering-detail">
              &nbsp;&nbsp; Priority Customer Service (24x7 Email, Telephone, Slack)
            </div>
            <div className=" offering-nocheck" />
            <div className=" offering-nocheck" />
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
          </div>
          <div className="offering-row offering-row-odd">
            <div className=" offering-detail">
              &nbsp;&nbsp; Developer API Support (Email)
            </div>
            <div className=" offering-nocheck" />
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
          </div>
          <div className="offering-row offering-row-even">
            <div className=" offering-detail">
              &nbsp;&nbsp; Developer API Support (Slack)
            </div>
            <div className=" offering-nocheck" />
            <div className=" offering-nocheck" />
            <div className=" offering-check">
              <ImageIcon icon={CheckIcon} className="offering-check-icon" />
            </div>
          </div>
        </div>

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
        </div>
        <div className="offerings service-offerings">
          <div className="offering-row offering-row-section-header no-border">
            <div className="">
              Priority Customer Service
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
        <div className="offerings-container-headers">
          <h1>Content Fabric Utility Rates</h1>
          <h2>Last Updated May 30, 2022</h2>
        </div>
        <OfferingsTable />

        { this.ServicePolicies() }
      </div>
    );
  }
}

export default Offerings;
