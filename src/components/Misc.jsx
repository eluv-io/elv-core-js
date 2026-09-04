import React, {useState} from "react";
import {observer} from "mobx-react";
import {Button, useMantineColorScheme} from "@mantine/core";
import SVG from "react-inlinesvg";
import {CreateModuleClassMatcher, JoinClassNames} from "../utils/Utils";
import SHA1 from "../utils/Hash";


import CopyIcon from "../static/icons/copy";
import LogoRing from "../static/images/Main_Logo_Ring.png";
import MonitorIcon from "../static/icons/monitor.svg";
import SunIcon from "../static/icons/sun.svg";
import MoonIcon from "../static/icons/moon.svg";

const S = CreateModuleClassMatcher();

/**
 * The Eluvio mark, as two stacked layers.
 *
 * Main_Logo_Light.png is a black wordmark plus a coloured ring in one raster.
 * There is no way to invert the text for a dark ground without dragging the
 * ring's hue along with it, which is what the earlier filter stopgap did.
 *
 * Main_Logo_Ring.png keeps the ring exactly as drawn. Main_Logo_Wordmark.png
 * is an alpha mask of the letterforms, painted with currentColor, so the text
 * follows the colour scheme and the brand hue never shifts.
 */
export const EluvioMark = ({className=""}) => (
  <div role="img" aria-label="Eluvio" className={JoinClassNames(S("eluvio-mark"), className)}>
    <img src={LogoRing} alt="" aria-hidden="true" className={S("eluvio-mark__ring")} />
    <span aria-hidden="true" className={S("eluvio-mark__wordmark")} />
  </div>
);

const COLOR_SCHEMES = [
  {value: "auto", label: "System", icon: MonitorIcon},
  {value: "light", label: "Light", icon: SunIcon},
  {value: "dark", label: "Dark", icon: MoonIcon}
];

/**
 * Appearance preference.
 *
 * Persistence is Mantine's default localStorageColorSchemeManager, under
 * `mantine-color-scheme-value`. The pre-paint script in index.html reads that
 * same key, so a reload applies the choice before first paint rather than
 * flashing the other theme, and the two stay in agreement with no extra
 * plumbing.
 *
 * "System" follows prefers-color-scheme and keeps following it — it is not a
 * snapshot of whatever the OS happened to be when it was picked.
 */
export const ColorSchemeControl = () => {
  const {colorScheme, setColorScheme} = useMantineColorScheme();

  return (
    <div className={S("color-scheme")}>
      <span id="color-scheme-label" className={S("color-scheme__label")}>Appearance</span>
      <div
        role="radiogroup"
        aria-labelledby="color-scheme-label"
        className={S("color-scheme__options")}
      >
        {
          COLOR_SCHEMES.map(({value, label, icon}) => (
            <label
              key={`color-scheme-${value}`}
              className={S("color-scheme__option", colorScheme === value ? "color-scheme__option--active" : "")}
            >
              <input
                type="radio"
                name="color-scheme"
                value={value}
                checked={colorScheme === value}
                onChange={() => setColorScheme(value)}
                className={S("color-scheme__input")}
              />
              <ImageIcon icon={icon} />
              <span>{label}</span>
            </label>
          ))
        }
      </div>
    </div>
  );
};

export const ButtonWithLoader = observer(({onClick, ...props}) => {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      {...props}
      loading={loading || props.loading}
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
  icon = icon || alternateIcon;

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

export const Copy = async (value) => {
  try {
    value = (value || "").toString();

    await navigator.clipboard.writeText(value);
  } catch(error) {
    const input = document.createElement("input");

    input.value = value;
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand("copy");
  }
};

export const CopyButton = ({value, className="", ...props}) => {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        if(copied) { return; }

        Copy(value);

        setCopied(true);
        setTimeout(() => setCopied(false), 600);
      }}
      className={JoinClassNames(S("copy-button", copied ? "copy-button--active" : ""), className)}
      title="Copy to Clipboard"
      {...props}
    >
      <SVG src={CopyIcon} alt="Copy" />
    </button>
  );
};

const HSLColor = (str="", s, l) => {
  const hue = SHA1(str).reduce((a, v) => a + v, 0) % 360;

  return `hsl(${hue}, ${s}%, ${l}%)`;
};

const canvas = document.createElement("canvas");
let profileImageUrls = {};
export const DefaultProfileImage = ({name, email, address}={}) => {
  name = name || email || "";

  if(!profileImageUrls[name]) {
    const context = canvas.getContext("2d");

    canvas.width = 200;
    canvas.height = 200;

    const gradient = context.createLinearGradient(0, 0, context.canvas.width, 0);
    gradient.addColorStop(0, HSLColor(address || name || email, 100, 30));
    gradient.addColorStop(1, HSLColor(address || name || email, 100, 20));

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = "400 100px Helvetica";
    context.fillStyle = "#FFFFFF";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(name.toUpperCase().charAt(0), canvas.width / 2, canvas.height / 2 + 5);

    profileImageUrls[name] = canvas.toDataURL("image/png");
  }

  return profileImageUrls[name];
};
