import InlineSVG from "svg-inline-react";
import React from "react";

const ImageIcon = ({ className="", title, icon }) => {
  if(icon.startsWith("<svg")) {
    return (
      <InlineSVG title={title} className={"icon " + className} src={icon}/>
    );
  } else {
    return (
      <img title={title} className={"icon " + className} src={icon} />
    );
  }
};

export default ImageIcon;
