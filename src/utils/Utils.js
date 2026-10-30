import SharedStyles from "@/assets/stylesheets/modules/shared.module.scss";

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

export const Sort = (list, sortStatus) => {
  list = [...list]
    .sort((a, b) => {
      let v1 = a[sortStatus.columnAccessor];
      let v2 = b[sortStatus.columnAccessor];

      v1 = typeof v1 === "string" ? v1.toLowerCase() :
        typeof v1 === "number" ? parseFloat(v1) : v1;
      v2 = typeof v2 === "string" ? v2.toLowerCase() :
        typeof v2 === "number" ? parseFloat(v2) : v2;

      return v1 < v2 ? -1 : 1;
    });

  if(sortStatus.direction === "desc") {
    list = list.reverse();
  }

  return list;
};
