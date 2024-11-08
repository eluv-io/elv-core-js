import React from "react";
import ReactMarkdown from "react-markdown";

import "../../static/stylesheets/offerings.scss";

import OfferingsConfig from "./offerings.yaml";

import CheckIcon from "../../static/icons/Check.svg";
import {ImageIcon} from "../Misc";

const RateTableSection = ({columns, section}) => {
  let { shared_name, shared_description, rows, column_sizing } = section;
  const columnStyle = column_sizing ? column_sizing.map(size => `${size}fr`).join(" ") : " 1fr ".repeat(columns.length);
  const columnCount = column_sizing ? column_sizing.reduce((acc, size) => acc + parseInt(size), 0) : columns.length;

  return (
    <div
      style={{gridTemplateColumns: `${shared_name ? "2fr" : ""} ${columnCount}fr ${shared_description ? " 2fr" : ""}`}}
      className="rate-table__body"
    >
      {
        shared_name ?
          <div className="rate-table__shared-cell rate-table__shared-cell--name">
            <ReactMarkdown>
              { shared_name }
            </ReactMarkdown>
          </div> : null
      }
      <div className="rate-table__rows">
        {rows.map((row, index) =>
          <div
            key={`table-row-${index}`}
            style={{gridTemplateColumns: row.length === 1 ? "1" : columnStyle}}
            className={`rate-table__row rate-table__row--${index % 2 === 0 ? "odd" : "even"} ${row.length === 1 ? "rate-table__row--subheader" : ""}`}
          >
            {row.map((value, columnIndex) =>
              <div key={`table-row-column-${columnIndex}`} className="rate-table__cell">
                {
                  value === "\\check" ? <ImageIcon icon={CheckIcon} className="rate-table__checkmark" /> :
                    <ReactMarkdown>{ typeof value === "number" ? value.toFixed(2) : value }</ReactMarkdown>
                }
              </div>
            )}
          </div>
        )}
      </div>
      {
        shared_description ?
          <div className="rate-table__shared-cell rate-table__shared-cell--description">
            <ReactMarkdown>
              { shared_description }
            </ReactMarkdown>
          </div> : null
      }
    </div>
  );
};

const RateTable = ({config}) => {
  let { id, title, subtitle, shared_name_column, shared_description_column, columns, column_sizing } = config;

  const columnStyle = column_sizing ? column_sizing.map(size => `${size}fr`).join(" ") : " 1fr ".repeat(columns.length);

  return (
    <div className="rate-table-container" id={id || ""}>
      <h2 className="rates__title">{ title }</h2>
      { subtitle ? <p className="rates__subtitle">{ subtitle }</p> : null }
      <div className="rate-table">
        <div
          style={{gridTemplateColumns: `${shared_name_column ? " 2fr" : ""} ${columnStyle} ${shared_description_column ? " 2fr" : ""}`}}
          className="rate-table__row rate-table__row--header"
        >
          {
            shared_name_column ?
              <div className="rate-table__cell rate-table__cell--header">
                <ReactMarkdown>
                  { shared_name_column }
                </ReactMarkdown>
              </div> : null
          }
          {columns.map((column, index) =>
            <div className="rate-table__cell rate-table__cell--header" key={`table-column-${column || index}`}>
              <ReactMarkdown>
                { column }
              </ReactMarkdown>
            </div>
          )}
          {
            shared_description_column ?
              <div className="rate-table__cell rate-table__cell--header">
                <ReactMarkdown>
                  { shared_description_column }
                </ReactMarkdown>
              </div> : null
          }
        </div>
        { (config.sections || [config]).map((section, sectionIndex) => <RateTableSection key={`section-${sectionIndex}`} columns={config.columns} section={section} />) }
      </div>
    </div>
  );
};

const Offerings = () => {
  return (
    <div className="rates">
      <div className="rates__headers">
        <h1 className="rates__header">Content Fabric Utility Rates</h1>
        <div className="rates__updated">Last Updated April 1, 2023</div>
      </div>
      { Object.keys(OfferingsConfig).map(key => <RateTable key={`rate-table-${key}`} config={OfferingsConfig[key]} />)}
    </div>
  );
};

export default Offerings;
