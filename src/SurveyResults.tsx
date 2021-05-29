import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { ListSurveyFormsQuery } from "./API";
import { API, graphqlOperation } from "aws-amplify";
import { JExcelElement } from "jexcel";
import jsonorder from "json-order";
import XLSX from "xlsx";
import { Button, makeStyles } from "@material-ui/core";
import { SaveAlt } from "@material-ui/icons";
const jspreadsheet = require("jspreadsheet-ce");

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
}));

interface Input {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Form {
  name: string;
  description: string;
  model: string;
}

interface Component {
  type: string;
  name: string;
  title: string;
  content: string;
}

const SurveyResults = () => {
  const classes = useStyles();
  const { resultKey } = useParams<{ resultKey: string }>();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<Form>();
  const [spreadSheet, setSpreadSheet] = useState<JExcelElement>();
  //const [inputs, setInputs] = useState<Input[]>([]);
  // const [spreadsheet, setSpreadsheet] = useState(null);

  useEffect(() => {
    if (!sheetRef.current?.hasChildNodes()) {
      fetchResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResults = async () => {
    const query = `
      query Query($resultKey: String!) {
        listSurveyForms(
          filter: {resultKey: {eq: $resultKey}}
        ) {
          items {
            id
            name
            description
            model
            results {
              items {
                id
                content
                createdBy
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `;
    const result = (await API.graphql(
      graphqlOperation(query, { resultKey })
    )) as GraphQLResult<ListSurveyFormsQuery>;
    // console.log(result);
    const items = result.data?.listSurveyForms?.items;
    if (items && items.length > 0 && items[0]) {
      const form = items[0] as Form;
      setForm(form);
      const columns = createColumns(form);
      const inputs = (form as any).results?.items as Input[];
      setInputs(columns, inputs);
      console.log(inputs);
    }
  };

  const createColumns = (form: Form): { title: string; width: number }[] => {
    const columns: { title: string; width: number }[] = (JSON.parse(form.model)
      .elements as {
      name: string;
    }[]).map((el) => {
      return { title: el.name, width: 100 };
    });
    return [
      { title: "id", width: 100 },
      ...columns,
      { title: "createdAt", width: 100 },
      { title: "updatedAt", width: 100 },
    ];
  };

  const setInputs = (
    columns: { title: string; width: number }[],
    inputs: Input[]
  ) => {
    if (inputs.length > 0) {
      // create header & jss instance
      const jss: JExcelElement = jspreadsheet(sheetRef.current, {
        columns,
        editable: false,
      });

      // create rows
      inputs.forEach((input, rowIndex) => {
        const data = {
          id: input.id,
          ...JSON.parse(input.content),
          createdAt: input.createdAt,
          updatedAt: input.createdAt,
        };
        // console.log(data);
        jss.insertRow();
        columns.forEach((column, columnIndex) => {
          const value = data[column.title];
          const text =
            typeof value === "string" ? value : JSON.stringify(value);
          jss.setValueFromCoords(columnIndex, rowIndex, text, true);
        });
      });
      jss.refresh();
      setSpreadSheet(jss);
    }
  };

  const handleDownload = () => {
    const data = [
      spreadSheet?.getHeaders([]),
      ...(spreadSheet?.getData() as any[][]),
    ];
    console.log(data);
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "results");
    XLSX.writeFile(wb, "results.xlsx");
  };

  return (
    <div>
      <h2>Results</h2>
      <div>{form?.name}</div>
      <div>{form?.description}</div>
      <div>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          startIcon={<SaveAlt />}
          onClick={handleDownload}
        >
          Download(XLSX)
        </Button>
      </div>
      <div id="spreadsheet" ref={sheetRef}></div>
    </div>
  );
};

export default SurveyResults;
