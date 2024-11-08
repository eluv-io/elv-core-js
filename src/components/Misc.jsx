import React, {useState} from "react";
import {observer} from "mobx-react";
import {Button} from "@mantine/core";
import SVG from "react-inlinesvg";
import {CreateModuleClassMatcher} from "../Utils";

const S = CreateModuleClassMatcher();

export const ButtonWithLoader = observer(({onClick, ...props}) => {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      {...props}
      loading={loading}
      onClick={async event => {
        try {
          setLoading(true);
          await onClick(event);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
});

export const ImageIcon = ({icon, alternateIcon, title, label, useLoadingIndicator=false, className, ...props}) => {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  label = label || title;

  className = "image-icon " + (className || "");

  const currentIcon = error ? alternateIcon : icon;
  const handleError = error ? undefined : () => setError(true);

  if(!currentIcon) {
    return null;
  }

  if(currentIcon.startsWith("<svg")) {
    return (
      <SVG alt={label} title={title} className={className} src={currentIcon} {...props} />
    );
  } else {
    className = loading && useLoadingIndicator ? "image-icon-with-loader " + className : className;

    return (
      <img
        title={title}
        alt={label}
        className={className}
        src={currentIcon}
        onLoad={() => setLoading(false)}
        onError={handleError}
        {...props}
      />
    );
  }
};

