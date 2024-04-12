import React, { useState } from "react";
import { Importer, ImporterField } from "react-csv-importer";
// My fork below:
// import { Importer, ImporterField } from "sigma-react-csv-importer";

// theme CSS for React CSV Importer
import "react-csv-importer/dist/index.css";

// basic styling and font for sandbox window
import "./index.css";

const CsvUploadBox = ({props}) => {
  const [refreshNeeded, setRefreshNeeded] = useState(false);
  const uploadColumnsArr = props.config.CSV_Columns === undefined ? [] : props.config.CSV_Columns.split(',').map((val) => val.trim());
  const sigmaCols = Object.keys(props.sigmaCols).map((colName) => colName.split('/')[1]);
  const config = props;

  return (
    <div style={{overflow: 'auto', resize: 'both'}}>
      <h1>CSV Upload to Snowflake</h1>
      {refreshNeeded && <div style={{color: 'green'}}>CSV Successfully Uploaded to Snowflake!</div>}
      {refreshNeeded && <div style={{color: 'red'}}>Please refresh the table to see updated data.</div>}
      <Importer
        dataHandler={async (rows) => {
          let counter = 1;
          let length = rows.length;
          for (const row of rows) {
            const response = await new Promise(async (resolve, reject) => {
              try {
                const res = await fetch('http://localhost:4000/uploadData', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    row: row,
                    count: counter,
                    totalRows: length, 
                    config,
                  })
                });
                resolve(res);
              } catch (error) {
                reject(error);
              }
            });

            if (response.status !== 200) {
              console.log(response.status);
              console.error(`Failed to insert row: ${JSON.stringify(row)}`);
            }
            counter++;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }}
        chunkSize={10000}
        defaultNoHeader={false}
        restartable={true}
        onStart={({ file, fields }) => {
          console.log("starting import of file", file, "with fields", fields);
        }}
        onComplete={({ file, fields }) => {
          setRefreshNeeded(true);
        }}
        onClose={() => {
          window.location.reload();
          console.log("importer dismissed");
        }}
      >
        {(uploadColumnsArr[0] === '' ? sigmaCols : uploadColumnsArr).map((val) => {
          const isRequired = val.includes('*');
          const cleanVal = val.replace('*', '');
          return (
            <ImporterField name={cleanVal} label={cleanVal} optional={!isRequired} />
          );
        })}
      </Importer>
    </div>
  );
};

export default CsvUploadBox;