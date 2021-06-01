import { API, Auth, graphqlOperation } from "aws-amplify";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ListSurveyFormsQuery } from "./API";
import * as Survey from "survey-react";
import { createSurveyInput, updateSurveyInput } from "./graphql/mutations";
import { makeStyles, Paper, Typography } from "@material-ui/core";
import { parseISO, format, isEqual } from "date-fns";
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
  const [createdAt, setCreatedAt] = useState<Date>();
  const [updatedAt, setUpdatedAt] = useState<Date>();
  // const [input, setInput] = useState<Input>();
  const [form, setForm] = useState<Form>();
  const [model, setModel] = useState<Survey.ReactSurveyModel>(
    new Survey.Model()
  );

  console.log("model.data", model.data);

  useEffect(() => {
    fetchAndSetFormAndItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAndSetFormAndItems = async () => {
    const result = await fetchFormAndItem();
    const form = getFormByResult(result);
    if (form) {
      setForm({ ...form } as Form);
      const model = new Survey.Model(form.model);
      setModel(model);
      const item = getItemByResult(result);
      if (item) {
        model.data = JSON.parse(item.content);
        setID(item.id);
        setCreatedAt(parseISO(item.createdAt));
        if (item.updatedAt) {
          setUpdatedAt(parseISO(item.updatedAt));
        }
      }
    }
  };

  const fetchFormAndItem = async () => {
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
                createdAt
                updatedAt
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
    return result;
  };

  const getFormByResult = (
    result: GraphQLResult<ListSurveyFormsQuery>
  ): Form | undefined => {
    const items = result.data?.listSurveyForms?.items;
    if (items && items.length > 0 && items[0]) {
      return items[0] as Form;
    }
  };

  const getItemByResult = (result: GraphQLResult<ListSurveyFormsQuery>) => {
    const form = getFormByResult(result);
    if (form) {
      const datas: any[] | null = (form as any).results?.items;
      if (datas && datas.length > 0 && datas[0]) {
        return datas[0];
      }
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
      // Check for existence before create.
      const result = await fetchFormAndItem();
      const item = getItemByResult(result);
      console.log(item);
      if (!item) {
        const user = await Auth.currentAuthenticatedUser({
          bypassCache: false,
        });
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
      } else {
        console.log("input data exists.");
      }
    }
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  const dateInfo = () =>
    createdAt && updatedAt ? (
      <>
        <Typography variant="h5" align="center" component="h1" gutterBottom>
          Answered at{" "}
          {format(
            isEqual(createdAt, updatedAt) ? createdAt : updatedAt,
            "yyyy/MM/dd HH:mm:ss"
          )}
        </Typography>
        {!isEqual(createdAt, updatedAt) ? (
          <Typography variant="h5" align="center" component="h1" gutterBottom>
            {updatedAt ? "The first answer was" : "Answered"} at{" "}
            {format(createdAt, "yyyy/MM/dd HH:mm:ss")}
          </Typography>
        ) : (
          <></>
        )}
      </>
    ) : (
      <></>
    );

  return form ? (
    <React.Fragment>
      <div className={classes.header}>
        <Typography variant="h4" align="center" component="h1" gutterBottom>
          {id
            ? "Thank you for your response to the survey."
            : "Answer the Survey."}
        </Typography>
        {dateInfo()}
        <Typography
          variant="h5"
          align="center"
          component="h2"
          gutterBottom
        ></Typography>
        <Typography paragraph align="center">
          {id
            ? 'Edit the following and click the "Complate" button again to update your answer.'
            : 'Please fill out the following survey form and click the "Complate" button.'}
        </Typography>
      </div>
      <Paper className={classes.paper}>
        <Typography variant="h5" align="center" component="h1" gutterBottom>
          {form.name}
        </Typography>
        <Typography paragraph align="center" gutterBottom style={{whiteSpace: 'pre-line'}}>
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
