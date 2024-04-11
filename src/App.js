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
  { name: "source", type: "element" },
  {
    name: "Inputs",
    type: "column",
    source: "source",
    allowMultiple: true,
    allowedTypes: ['datetime', 'integer', 'text', 'boolean', 'number']
  },
  { name: "CSV_Columns", label: "CSV Columns", type: "text"}
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
