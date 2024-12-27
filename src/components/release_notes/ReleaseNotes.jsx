import ReleaseNotesStyles from "../../static/stylesheets/modules/release-notes.module.scss";

import React, {useEffect, useState} from "react";
import {observer} from "mobx-react";
import {rootStore} from "../../stores";
import {Loader} from "@mantine/core";
import {CreateModuleClassMatcher} from "../../utils/Utils";

const S = CreateModuleClassMatcher(ReleaseNotesStyles);


const Note = observer(({title, date, text, showInitially=false}) => {
  const [show, setShow] = useState(showInitially);

  try {
    date = date && new Date(date);
  } catch(error) {
    rootStore.Log(`Bad date for ${title}: ${date}`, true);
  }

  return (
    <div className={S("note", show ? "note--opened" : "")}>
      {
        !title && !date ? null :
          <button onClick={() => setShow(!show)} className={S("note__title-container")}>
            {
              !title ? null :
                <h2 className={S("note__title")}>
                  {title}
                </h2>
            }
            {
              !date ? null :
                <h3 className={S("note__date")}>
                  { date.toLocaleDateString(undefined, {month: "long", day: "numeric", year: "numeric"}) }
                </h3>
            }
          </button>
      }
      <div
        className={S("note__text", !text || !show ? "note__text--hidden" : "note__text--visible")}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
});

const ReleaseNotes = observer(() => {
  useEffect(() => {
    if(!rootStore.client) { return; }

    rootStore.LoadReleaseNotes();
  }, [rootStore.client]);

  if(!rootStore.releaseNotes) {
    return <Loader className={S("page-loader")} />;
  }

  return (
    <div className="page-content">
      <div className={S("release-notes-page")}>
        <h1 className={S("page-header")}>Release Notes</h1>

        <div className={S("notes")}>
          {
            rootStore.releaseNotes.map((note, index) =>
              <Note {...note} showInitially={index === 0} key={`note-${index}`} />
            )
          }
        </div>
      </div>
    </div>
  );
});

export default ReleaseNotes;
