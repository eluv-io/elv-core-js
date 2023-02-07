import React from "react";
import {ImageIcon} from "elv-components-js";

import "../../static/stylesheets/offerings.scss";

import OfferingsConfig from "./offerings.yaml";

import CheckIcon from "../../static/icons/Check.svg";

const RateTableSection = ({columns, section}) => {
  let { shared_name, shared_description, rows, column_sizing } = section;
  const columnStyle = column_sizing ? column_sizing.map(size => `${size}fr`).join(" ") : " 1fr ".repeat(columns.length);
  const columnCount = column_sizing ? column_sizing.reduce((acc, size) => acc + parseInt(size), 0) : columns.length;

  return (
    <div
      style={{gridTemplateColumns: `${shared_name ? "1fr" : ""} ${columnCount}fr ${shared_description ? " 2fr" : ""}`}}
      className="rate-table__body"
    >
      { shared_name ? <div className="rate-table__shared-cell rate-table__shared-cell--name">{ shared_name }</div> : null }
      <div className="rate-table__rows">
        {rows.map((row, index) =>
          <div
            key={`table-row-${index}`}
            style={{gridTemplateColumns: columnStyle}}
            className={`rate-table__row rate-table__row--${index % 2 === 0 ? "odd" : "even"} ${row.length === 1 ? "rate-table__row--subheader" : ""}`}
          >
            {row.map((value, columnIndex) =>
              <div key={`table-row-column-${columnIndex}`} className="rate-table__cell">
                { value === "\\check" ? <ImageIcon icon={CheckIcon} className="rate-table__checkmark" /> : value }
              </div>
            )}
          </div>
        )}
      </div>
      { shared_description ? <div className="rate-table__shared-cell rate-table__shared-cell--description">{ shared_description }</div> : null }
    </div>
  );
};

const RateTable = ({config}) => {
  let { title, subtitle, shared_name_column, shared_description_column, columns, column_sizing } = config;

  const columnStyle = column_sizing ? column_sizing.map(size => `${size}fr`).join(" ") : " 1fr ".repeat(columns.length);

  return (
    <div className="rate-table-container">
      <h2 className="rates__title">{ title }</h2>
      { subtitle ? <p className="rates__subtitle">{ subtitle }</p> : null }
      <div className="rate-table">
        <div
          style={{gridTemplateColumns: `${shared_name_column ? " 1fr" : ""} ${columnStyle} ${shared_description_column ? " 2fr" : ""}`}}
          className="rate-table__row rate-table__row--header"
        >
          { shared_name_column ? <div className="rate-table__cell rate-table__cell--header">{ shared_name_column }</div> : null }
          {columns.map(column =>
            <div className="rate-table__cell rate-table__cell--header" key={`table-column-${column}`}>
              { column }
            </div>
          )}
          { shared_description_column ? <div className="rate-table__cell rate-table__cell--header">{ shared_description_column }</div> : null }
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
        <div className="rates__updated">Last Updated February 7, 2023</div>
      </div>
      { Object.keys(OfferingsConfig).map(key => <RateTable key={`rate-table-${key}`} config={OfferingsConfig[key]} />)}
    </div>
  );
};

export default Offerings;
