import FooterStyles from "@/assets/stylesheets/modules/footer.module.scss";

import React from "react";
import {observer} from "mobx-react";
import {CreateModuleClassMatcher} from "@/utils/Utils";
import {Link, useLocation} from "wouter";

const S = CreateModuleClassMatcher(FooterStyles);

const Footer = observer(() => {
  const [location] = useLocation();
  if(location.match(/^\/apps\/.+$/)) {
    // App frame is visible - hide navigation
    return null;
  }

  return (
    <div className={S("footer")}>
      <nav className={S("nav")}>
        <a href="https://eluv.io" target="_blank" rel="noreferrer">eluv.io</a>
        <a href="https://eluv.io/terms" target="_blank" rel="noreferrer">End User Agreement</a>
        <a href="https://eluv.io/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
        <a href="https://eluv.io/platform-terms" target="_blank" rel="noreferrer">Tenant Platform Services Agreement</a>
        <Link to="/release_notes">Release Notes</Link>
      </nav>
    </div>
  );
});

export default Footer;
