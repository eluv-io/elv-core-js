import {useLocation} from "react-router-dom";
import {useEffect} from "react";

export const ScrollTo = ({top=0, target, behavior="smooth"}) => {
  if(target) {
    top = target.getBoundingClientRect().top + window.scrollY + top;
  }

  // Mobile has a bug that prevents scroll top from working
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    window.scrollTo(0, top);
  } else {
    window.scrollTo({top, behavior});
  }
};

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    ScrollTo({top: 0, behavior: "auto"});
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
