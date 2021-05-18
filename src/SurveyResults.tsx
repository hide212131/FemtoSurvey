import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { ListSurveyFormsQuery } from "./API";
import { API, graphqlOperation } from "aws-amplify";
import { JExcelElement } from "jexcel";
import jsonorder from "json-order";
const jspreadsheet = require("jspreadsheet-ce");

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

const SurveyResults = () => {
  const { resultKey } = useParams<{ resultKey: string }>();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<Form>();
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
      const inputs = (form as any).results?.items as Input[];
      setInputs(inputs);
      console.log(inputs);
    }
  };

  const setInputs = (inputs: Input[]) => {
    if (inputs.length > 0) {
      // create header & jss instance
      const content = inputs[0].content;
      const columns: { title: string; width: number }[] = [
        { title: "id", width: 100 },
        ...((jsonorder.parse(content) as any).map.$ as string[]).map((name) => {
          return { title: name, width: 300 };
        }),
      ];
      const jss: JExcelElement = jspreadsheet(sheetRef.current, {
        columns,
        editable: false,
      });

      // create rows
      inputs.forEach((input, rowIndex) => {
        const data = { id: input.id, ...JSON.parse(input.content) };
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
    }
  };

  return (
    <div>
      <h2>Results</h2>
      <div>{form?.name}</div>
      <div>{form?.description}</div>
      <div id="spreadsheet" ref={sheetRef}></div>
    </div>
  );
};

export default SurveyResults;
