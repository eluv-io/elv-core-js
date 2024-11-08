import SharedStyles from "./static/stylesheets/modules/shared.module.scss";

export const JoinClassNames = (...cs) => cs.map(c => c || "").join(" ");

export const CreateModuleClassMatcher = (...modules) => {
  modules = [...modules, SharedStyles];

  return (...classes) => JoinClassNames(
    ...(classes.map(c => {
      return modules
        .map(m => m?.[c])
        .filter(c => c)
        .join(" ");
    }))
  );
};

export const DownloadFromUrl = (url, filename, options={}) => {
  let element = document.createElement("a");
  element.href = url;

  if(filename) {
    element.download = filename;
  }

  Object.keys(options).forEach(key => element[key] = options[key]);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
  window.URL.revokeObjectURL(url);
};

export const ValidEmail = email => {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    .test(email);
};
