import React from "react";
import {ImageIcon} from "elv-components-js";
import CheckIcon from "../static/icons/Check.svg";

const html = (
  <div className="offerings">
    <div className="offering-row offering-row-header">
      <div className=" offering-nocheck">
        
      </div>
      <div className="">
        Basic
      </div>
      <div className="">
        Boutique
      </div>
      <div className="">
        Tier 1
      </div>
    </div>
    <div className="offering-row offering-row-header">
      <div className=" offering-nocheck">
        
      </div>
      <div className="">
        $5/serviceable title/mo
      </div>
      <div className="">
        $10/serviceable title/mo
      </div>
      <div className="">
        $20/serviceable title/mo
      </div>
    </div>
    <div className="offering-row offering-row-header">
      <div className=" offering-nocheck">
        
      </div>
      <div className="">
        $0.25/viewable hour streamed
      </div>
      <div className="">
        $0.25/viewable hour streamed
      </div>
      <div className="">
        $0.25/viewable hour streamed
      </div>
    </div>
    <div className="offering-row offering-row-section-header">
      <div className="">
        OTT Publishing and Distribution
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className="">
        Direct Ingest from File System and Cloud Storage 
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
        &nbsp;&nbsp; By reference and by copy
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
        &nbsp;&nbsp; From S3 and Glacier, via Direct Connect
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
        &nbsp;&nbsp; Any master format
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
        &nbsp;&nbsp; Automatic creation of serviceable master and mezz
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
        &nbsp;&nbsp; Publishing and Streaming APIs (github)
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
      <div className="">
        Automatic Versioning of Content w/ Metadata
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
        &nbsp;&nbsp; All content (master and mezz) versions recorded
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
        &nbsp;&nbsp; All version updates (tracks, metadata) by reference so no copies
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
        &nbsp;&nbsp; Native IMF ingest and version updates
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
      <div className="">
        Global Streaming (ABR) on publishing
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
        &nbsp;&nbsp; Web, mobile, TVE
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
        &nbsp;&nbsp; DRM Widevine, HLS, etc.
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
        &nbsp;&nbsp; No 3rd party CDN, cloud transcoding, or storage
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
        &nbsp;&nbsp; Globally replicated, no single points or geo of failure
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
        &nbsp;&nbsp; Trustless security model
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
        &nbsp;&nbsp; Any standards-compliant player
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
      <div className="">
        File Download API
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
        &nbsp;&nbsp; File and directory download of assets
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
      <div className="">
        Built in Rights/Availability Management
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className=" offering-detail">
        &nbsp;&nbsp; Time, Viewer Geo, by User, by Group
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className="">
        Visible Watermarking Per User
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className=" offering-detail">
        &nbsp;&nbsp; User name dynamically overlayed
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className="">
        Audience Access Data
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
        &nbsp;&nbsp; Basic audience watch data (summarized)
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
        &nbsp;&nbsp; Detailed and provable (blockchain recorded)
      </div>
      <div className=" offering-nocheck">
        
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
        &nbsp;&nbsp; All playback and access events with user detail (platform, format, geo, etc)
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className="">
        Site API & Static Content Delivery
      </div>
      <div className=" offering-nocheck">
        
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
        &nbsp;&nbsp; Reusable "site" API for dynamic and static content in front end
      </div>
      <div className=" offering-nocheck">
        
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
        &nbsp;&nbsp; Static & dynamic URL-based content delivery for images, metadata
      </div>
      <div className=" offering-nocheck">
        
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
        &nbsp;&nbsp; Customizable publishing app (replaces CMS)
      </div>
      <div className=" offering-nocheck">
        
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
        &nbsp;&nbsp; Search API 
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-section-header">
      <div className="">
        Monetization
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className="">
        Automatic Tagging of Asset using ML
      </div>
      <div className=" offering-nocheck">
        
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
        &nbsp;&nbsp; Object, Celebrity, Landmark (frame level)
      </div>
      <div className=" offering-nocheck">
        
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
        &nbsp;&nbsp; Segment Content (period level)
      </div>
      <div className=" offering-nocheck">
        
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
        &nbsp;&nbsp; Textual capture and automatic subtitle processing
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className="">
        Dynamic Clip Generation
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className=" offering-detail">
        &nbsp;&nbsp; Using time code or metadata tags
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className="">
        Tag based Search
      </div>
      <div className=" offering-nocheck">
        
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
        &nbsp;&nbsp; Across all assets by tag
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className="">
        Ad insertion
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className=" offering-detail">
        &nbsp;&nbsp; Within fabric or from 3rd party servers *
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-section-header">
      <div className="">
        Master Servicing
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className="">
        Metadata and Video Update and Versioning
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className=" offering-detail">
        &nbsp;&nbsp; Frame Accurate Video Editor with metadata curation, clipping, editing
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className=" offering-detail">
        &nbsp;&nbsp; Automatic upres of SD / lower quality content using ML
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className="">
        OTT Outlet Packaging and Download (BtoB) *
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className=" offering-detail">
        &nbsp;&nbsp; File download * could include integration with Aspera delivery
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className=" offering-detail">
        &nbsp;&nbsp; Automatic Generation of OTT metadata from profile 
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className=" offering-detail">
        &nbsp;&nbsp; Built in and extensible profiles for major OTTS (Amazon, Netflix...)
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className=" offering-detail">
        &nbsp;&nbsp; Automatic availability management
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className="">
        Enterprise OAuth Integration
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className=" offering-detail">
        &nbsp;&nbsp; Fabric access control with OAuth/SSO groups
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-check">
        <ImageIcon icon={CheckIcon} className="offering-check-icon" />
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className="">
        Notes
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className=" offering-detail">
        &nbsp;&nbsp; Live streaming options (in beta)
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
    </div>
    <div className="offering-row offering-row-odd">
      <div className=" offering-detail">
        &nbsp;&nbsp; Linear Channel Playout Options (upcoming 2020)
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
    </div>
    <div className="offering-row offering-row-even">
      <div className="">
        * Feature upcoming in 2020
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
      <div className=" offering-nocheck">
        
      </div>
    </div>

  </div>
);

export default html;