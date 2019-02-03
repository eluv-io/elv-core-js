import InlineSVG from "svg-inline-react";
import React from "react";

export const CroppedIcon = ({containerClassname, className, title, icon}) => {
  return (
    <div className={containerClassname || ""}>
      <div className="cropped-icon">
        <ImageIcon icon={icon} title={title} className={className} />
      </div>
    </div>
  );
};

export const CroppedIconWithAction = ({containerClassname, className, title, icon, children}) => {
  return (
    <div className={containerClassname || ""}>
      <div className="cropped-icon">
        <ImageIcon icon={icon} title={title} className={className} />
        <div className="hover-action">
          { children}
        </div>
      </div>
    </div>
  );
};

export const ImageIcon = ({ className, title, icon }) => {
  if(icon.startsWith("<svg")) {
    return (
      <InlineSVG title={title} className={"icon " + className || ""} src={icon}/>
    );
  } else {
    return (
      <img title={title} className={"icon " + className || ""} src={icon} />
    );
  }
};

export const IconButton = ({src, title, onClick, className=""}) => {
  return (
    <button className={"icon-button " + className} type="button" role="button" title={title} onClick={onClick}>
      <InlineSVG className="icon dark clickable" src={src} />
    </button>
  );
};
