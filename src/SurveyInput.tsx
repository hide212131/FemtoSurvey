import { API, Auth, graphqlOperation } from "aws-amplify";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ListSurveyFormsQuery } from "./API";
import * as Survey from "survey-react";
import { createSurveyInput, updateSurveyInput } from "./graphql/mutations";
import {
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
//Define Survey JSON
//Here is the simplest Survey with one text question
const useStyles = makeStyles((theme) => ({
  header: {
    marginTop: theme.spacing(2),
  },
  layout: {
    display: "flex",
    width: "auto",
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(1200 + theme.spacing(2) * 2)]: {
      width: 1200,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  select: {
    marginTop: theme.spacing(1),
  },
  formControl: {
    marginTop: theme.spacing(1),
    minWidth: 120,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

interface Form {
  id: string;
  name: string;
  description: string | null | undefined;
  model: string;
}

interface Input {
  id?: string;
  content: string;
  createdBy?: string;
  formID?: string;
}

const SurveyInput = () => {
  const classes = useStyles();
  console.log("SurveyInput render");
  const { inputKey } = useParams<{ inputKey: string }>();
  const [id, setID] = useState<string>();
  // const [input, setInput] = useState<Input>();
  const [form, setForm] = useState<Form>();
  const [model, setModel] = useState<Survey.ReactSurveyModel>(
    new Survey.Model()
  );

  console.log("model.data", model.data);

  useEffect(() => {
    fetchForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchForm = async () => {
    const user = await Auth.currentAuthenticatedUser({ bypassCache: false });
    const username = user.username;
    const query = `
      query Query($inputKey: String!, $username: String!) {
        listSurveyForms(
          filter: {inputKey: {eq: $inputKey}}
        ) {
          items {
            results(
              filter: {createdBy: {eq: $username}}
            ) {
              items {
                id
                content
              }
            }
            id
            name
            description
            model
          }
        }
      }
    `;
    const result = (await API.graphql(
      graphqlOperation(query, { inputKey, username })
    )) as GraphQLResult<ListSurveyFormsQuery>;

    console.log("fetch reslt", { inputKey, username, result });

    const items = result.data?.listSurveyForms?.items;
    if (items && items.length > 0 && items[0]) {
      const form = items[0];
      setForm({ ...form } as Form);
      const model = new Survey.Model(form.model);
      const datas: any[] | null = (form as any).results?.items;
      if (datas && datas.length > 0 && datas[0]) {
        const item = datas[0];
        model.data = JSON.parse(item.content);
        setID(item.id);
      }
      setModel(model);
    }
  };

  const onComplete = async (survey: any, options: any) => {
    console.log("id:", id);
    if (id) {
      const input: Input = {
        id,
        content: JSON.stringify(survey.data),
      };
      try {
        const result = await API.graphql(
          graphqlOperation(updateSurveyInput, { input })
        );
        console.log(result);
      } catch (err) {
        console.log("error updateing input:", err);
      }
    } else {
      const user = await Auth.currentAuthenticatedUser({ bypassCache: false });
      const createdBy = user.username;
      const input: Input = {
        createdBy,
        content: JSON.stringify(survey.data),
        formID: form?.id,
      };
      try {
        const result = await API.graphql(
          graphqlOperation(createSurveyInput, { input })
        );
        console.log(result);
      } catch (err) {
        console.log("error creating todo:", err);
      }
    }
  };

  return form ? (
    <React.Fragment>
      <div className={classes.header}>
        <Typography variant="h4" align="center" component="h1" gutterBottom>
          Answer the Survey
        </Typography>
        <Typography
          variant="h5"
          align="center"
          component="h2"
          gutterBottom
        ></Typography>
        <Typography paragraph align="center">
          Please fill out the following survey form and click the "Complate"
          button.
        </Typography>
      </div>
      <Paper className={classes.paper}>
        <Typography variant="h5" align="center" component="h1" gutterBottom>
          {form.name}
        </Typography>
        <Typography paragraph align="center" gutterBottom>
          {form.description}
        </Typography>
        <Survey.Survey
          model={model}
          onComplete={onComplete}
          showCompletedPage={true}
        />
      </Paper>
    </React.Fragment>
  ) : (
    <div></div>
  );
};

export default SurveyInput;
