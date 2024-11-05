import FooterStyles from "./static/stylesheets/modules/footer.module.scss";

import React from "react";
import {observer} from "mobx-react";
import {NavLink} from "react-router-dom";
import {CreateModuleClassMatcher} from "./Utils";
import {useLocation} from "react-router";

const S = CreateModuleClassMatcher(FooterStyles);

const Footer = observer(() => {
  const location = useLocation();
  if(location.pathname.match(/^\/apps\/.+$/) || location.pathname.startsWith("/onboard")) {
    // App frame is visible - hide navigation
    // or onboard form
    return null;
  }

  return (
    <div className={S("footer")}>
      <nav className={S("nav")}>
        <NavLink to="/offerings">Offerings</NavLink>
        <a href="https://eluv.io/terms" target="_blank" rel="noreferrer">End User Agreement</a>
        <a href="https://eluv.io/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
        <a href="https://eluv.io/platform-terms" target="_blank" rel="noreferrer">Tenant Platform Services Agreement</a>
      </nav>
    </div>
  );
});

export default Footer;
