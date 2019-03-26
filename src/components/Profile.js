import "../static/stylesheets/profile.scss";

import React from "react";
import {CroppedIconWithAction, IconButton} from "elv-components-js/src/components/Icons";
import {BallClipRotate} from "elv-components-js/src/components/AnimatedIcons";
import DefaultProfileImage from "../static/icons/User.svg";
import RadioSelect from "elv-components-js/src/components/RadioSelect";
import Path from "path";

import XIcon from "../static/icons/X.svg";
import KeyIcon from "../static/icons/Key.svg";

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      browseRef: React.createRef(),
      newName: "",
      updating: false,
      showKey: false
    };

    this.excludedTags = [
      "collected_data",
      "accessed_content",
      "allowed_accessors",
      "image"
    ];

    this.HandleProfileImageChange = this.HandleProfileImageChange.bind(this);
    this.HandleNameChange = this.HandleNameChange.bind(this);
    this.HandleAccessLevelChange = this.HandleAccessLevelChange.bind(this);
    this.RevokeAccessor = this.RevokeAccessor.bind(this);
  }

  Update(fn) {
    if(this.state.updating) { return; }

    this.setState({updating: true});

    fn().then(() => this.setState({updating: false}));
  }

  HandleNameChange(event) {
    // Submit when enter is pressed
    if(event.key && event.key.toLowerCase() !== "enter") { return; }

    this.Update(async () => {
      await this.props.ReplacePublicUserMetadata({metadataSubtree: "name", metadata: this.state.newName});

      this.setState({
        modifyingName: false
      });
    });
  }

  async HandleProfileImageChange(event) {
    this.Update(async () =>
      await this.props.UpdateUserProfileImage(event.target.files[0])
    );
  }

  async HandleAccessLevelChange(event) {
    this.Update(async () =>
      await this.props.ReplacePrivateUserMetadata({metadataSubtree: "access_level", metadata: event.target.value})
    );
  }

  async RevokeAccessor(accessor) {
    this.Update(async () => {
      if (confirm(`Are you sure you want to revoke profile access from ${accessor}?`)) {
        await this.props.DeletePrivateUserMetadata({metadataSubtree: Path.join("allowed_accessors", accessor)});
      }
    });
  }

  Permissions(privateMetadata) {
    const permissionSelection = (
      <RadioSelect
        name="access_level"
        label="Access Level"
        options={[
          ["Public access", "public"],
          ["Prompt", "prompt"],
          ["Private - No access", "private"],
        ]}
        selected={privateMetadata.access_level || "prompt"}
        onChange={this.HandleAccessLevelChange}
      />
    );

    let allowedAccessors = Object.keys(privateMetadata.allowed_accessors || {})
      .sort((a, b) => privateMetadata.allowed_accessors[a] > privateMetadata.allowed_accessors[b] ? -1 : 1);

    return (
      <div>
        <div className="info-section">
          <h4>Permissions</h4>
          <h5 className="subheader">Here you can specify whether applications can request access to your personal information</h5>
          <div className="indented">
            { permissionSelection }
          </div>
        </div>
        <div className="info-section">
          <h4>Applications</h4>
          <h5 className="subheader">The following applications have access to your private profile</h5>
          <div className="indented">
            {allowedAccessors.map(accessor =>
              <div className="labelled-field application-permission" key={"accessor-row-" + accessor}>
                <label>{accessor}</label>
                <IconButton
                  icon={XIcon}
                  title={`Revoke profile access from ${accessor}`}
                  onClick={() => this.RevokeAccessor(accessor)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  CollectedTags(tags) {
    if(!tags) { return null; }

    let sortedTags = Object.keys(tags)
      .map(tag => { return {tag, ...tags[tag]}; })
      .sort((a, b) => a.aggregate < b.aggregate ? 1 : -1)
      .map(tag => {
        return (
          <tr key={`tag-row-${tag.tag}`}>
            <td>{tag.tag}</td>
            <td>{tag.aggregate.toFixed(2)}</td>
            <td>{tag.occurrences}</td>
          </tr>
        );
      });


    return (
      <div className="info-section">
        <h4>Tags based on viewing history</h4>
        <div className="">
          <table>
            <thead>
              <tr>
                <th>Tag</th>
                <th>Aggregate Score</th>
                <th>Occurrences</th>
              </tr>
            </thead>
            <tbody>
              {sortedTags}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  MetadataField(header, metadata) {
    if(!metadata) { metadata = {}; }

    const metadataFields = Object.keys(metadata).map(key => {
      if(this.excludedTags.includes(key)) { return null; }

      let value = metadata[key];
      if(typeof value === "object") {
        value = <pre>{JSON.stringify(metadata[key], null, 2)}</pre>;
      } else {
        value = <span>{metadata[key]}</span>;
      }

      return (
        <div className="labelled-field" key={`${header}-${key}`}>
          <label>{key}</label>
          {value}
        </div>
      );
    });

    return (
      <div className="info-section">
        <h4>{header}</h4>
        <div className="indented">
          { metadataFields }
        </div>
      </div>
    );
  }

  PrivateKey() {

    return (
      <span className="private-key-container">
        <IconButton icon={KeyIcon} title={`${this.state.showKey ? "Hide" : "Show"} Private Key`} onClick={() => this.setState({showKey: !this.state.showKey})}/>
        <span className={`private-key ${this.state.showKey ? "visible" : ""}`}>
          { this.state.showKey ? this.props.account.signer.privateKey : "" }
        </span>
      </span>
    );
  }

  ProfileImage() {
    const profileImage = this.props.account.profileImage || DefaultProfileImage;
    const updateIndicator = this.state.updating ? <div className="update-indicator"><BallClipRotate /></div> : undefined;
    return (
      <div className="profile-image-container-container">
        <div className="profile-image-container">
          {updateIndicator}
          <CroppedIconWithAction
            icon={profileImage}
            title="Profile Image"
            actionText="Profile Image"
            onClick={() => this.state.browseRef.current.click()}
            className="profile-image"
          >
            <input ref={this.state.browseRef} type="file" multiple={false} accept="image/*" hidden={true} onChange={this.HandleProfileImageChange}/>
          </CroppedIconWithAction>
        </div>
      </div>
    );
  }

  Name() {
    const name = this.props.account.profile.name || "Account Name";

    if(this.state.modifyingName) {
      return (
        <div className="modifiable-field modifying">
          <div className="modifiable-field-input">
            <input placeholder="Name" value={this.state.newName} onChange={(event) => this.setState({newName: event.target.value})} onKeyPress={this.HandleNameChange}/>
            <IconButton icon={XIcon} title="Cancel" className="cancel-button" onClick={() => this.setState({modifyingName: false})}/>
          </div>
        </div>
      );
    } else {
      const StartEditing = () => this.setState({modifyingName: true, newName: name || ""});
      return (
        <div className="modifiable-field">
          <h3 tabIndex={0} className="page-header modifiable-field" onClick={StartEditing} onKeyPress={StartEditing}>
            {name}
          </h3>
        </div>
      );
    }
  }

  render() {
    const balance = this.props.account.balance;

    let privateMetadata, collectedTags, permissions;
    //privateMetadata = this.UserProfile().privateMetadata;
    //TODO: get private metadata
    privateMetadata = this.props.account.privateProfile;
    collectedTags = this.CollectedTags(privateMetadata.collected_data);
    permissions = this.Permissions(privateMetadata);
    privateMetadata = this.MetadataField("Private Information", privateMetadata);

    return (
      <div className="page-content">
        <div className="profile">
          { this.ProfileImage() }
          <div className="profile-info">
            <div className="user-info">
              { this.Name() }
              <div className="page-subheader">{this.props.account.address}</div>
              <div className="page-subheader">{balance}</div>
              { this.PrivateKey() }
            </div>
            { this.MetadataField("Public Information", this.props.account.profile) }
            { privateMetadata }
            { permissions }
            { collectedTags }
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;

