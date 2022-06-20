const fs = require("fs");
const CSVParse = require("csv-parse/lib/sync");

const Parse = async () => {
  const csv = fs.readFileSync(__dirname + "/csv.csv").toString("utf8");

  const rows = CSVParse(csv);
  let rowHeader = true;
  let rowIndex = 0;
  const html = rows
    .map(columns => {
      if(!columns.find(col => col)) {
        return undefined;
      }

      return (
        columns
          .map((column, columnIndex) =>
            `      <div className="offerings-cell column-${columnIndex + 1}">\n        {"${column.replace("\n", "").replace("\r", "").replace("\"", "\\\"")}"}\n      </div>`
          )
          .join("\n")
      );
    })
    .map(rowHTML => {
      if(!rowHTML) {
        rowHeader = true;
        rowIndex = 0;
        return;
      }

      const row = `    <div className="offering-row ${rowHeader ? "offering-row-header" : ""} offering-row-${rowIndex % 2 === 0 ? "even" : "odd"}">\n${rowHTML}\n    </div>`;

      rowHeader = false;
      rowIndex += 1;

      return row;
    })
    .join("\n");

  let fileText = "";
  fileText += "import React from \"react\";\n\n";
  fileText += "const OfferingsTable = () => (\n";
  fileText += `  <div className="offerings">\n${html}\n  </div>`;
  fileText += "\n);\n\n";
  fileText += "export default OfferingsTable;";

  fs.writeFileSync(
    __dirname + "/OfferingsTable.js",
    fileText
  );
};

Parse();
