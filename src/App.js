import logo from './logo.svg';
import './App.css';
import CsvUploadBox from './csvUploadBox';

import {
  client,
  useConfig,
  useElementColumns,
  useElementData,
 } from "@sigmacomputing/plugin";
 
 
 client.config.configureEditorPanel([
  // { name: "source", type: "element" },
  // {
  //   name: "Inputs",
  //   type: "column",
  //   source: "source",
  //   allowMultiple: true,
  //   allowedTypes: ['datetime', 'integer', 'text', 'boolean', 'number']
  // },
  { name: "CSV_Columns", label: "CSV Columns", type: "text"},
  { name: "SNOWFLAKE_ACCOUNT", label: "Snowflake Account", type: "text", secure: true},
  { name: "SNOWFLAKE_USERNAME", label: "Snowflake Username", type: "text", secure: true},
  { name: "SNOWFLAKE_PASSWORD", label: "Snowflake Password", type: "text", secure: true},
  { name: "SNOWFLAKE_ROLE", label: "Snowflake Role", type: "text", secure: true},
  { name: "SNOWFLAKE_WAREHOUSE", label: "Snowflake Warehouse", type: "text"},
  { name: "SNOWFLAKE_DATABASE", label: "Snowflake Database", type: "text"},
  { name: "SNOWFLAKE_SCHEMA", label: "Snowflake Schema", type: "text"},
  { name: "SNOWFLAKE_TABLE", label: "Snowflake Table", type: "text"},
 ]);
 
 
 const App = () => {
  const config = useConfig();
  const props = {
    config,
    sigmaCols: useElementColumns(config.source),
    sigmaData: useElementData(config.source)

  }

  return (
    <div className="App">
      <CsvUploadBox props={props}/>
    </div>
  );
}

export default App;
