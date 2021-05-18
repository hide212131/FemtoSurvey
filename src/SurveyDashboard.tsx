//In your react App.js or yourComponent.js file add these lines to import
import "survey-react/survey.css";
import "./spreadsheetwidget";
import "jsuites/dist/jsuites.css";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jspreadsheet-ce/dist/jspreadsheet.theme.css";
import React, { useEffect, useState } from "react";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { listSurveyForms } from "./graphql/queries";
import { ListSurveyFormsQuery, ListSurveyInputsQuery } from "./API";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { Link } from "react-router-dom";
import {
  makeStyles,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
//Define Survey JSON
//Here is the simplest Survey with one text question
const useStyles = makeStyles((theme) => ({
  header: {
    marginTop: theme.spacing(2),
  },
  layout: {
    display: "block",
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
    width: "100%",
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

interface Input {
  id?: string;
  content: string;
  createdBy?: string;
  form: Form;
}

interface Form {
  id?: string;
  name?: string;
  description?: string;
  model?: string;
  inputKey?: string;
  resultKey?: string;
}

const SurveyDashboard = () => {
  const classes = useStyles();
  const [createdSurveyForms, setCreatedSurveyForms] = useState<Form[]>();
  const [createdSurveyInputs, setCreatedSurveyInputs] = useState<Input[]>();

  useEffect(() => {
    Auth.currentAuthenticatedUser({
      bypassCache: false, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    })
      .then((user) => {
        listCreatedSurveyInputs(user.username);
        listCreatedSurveyForms(user.username);
      })
      .catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listCreatedSurveyForms = async (username: string) => {
    // TODO: custom resolver
    const result = (await API.graphql(
      graphqlOperation(listSurveyForms, {
        filter: { createdBy: { eq: username } },
      })
    )) as GraphQLResult<ListSurveyFormsQuery>;
    setCreatedSurveyForms(result.data?.listSurveyForms?.items as Form[]);
  };

  const listCreatedSurveyInputs = async (username: string) => {
    // TODO: custom resolver
    const result = (await API.graphql(
      graphqlOperation(
        `query Query($username: String!) {
          listSurveyInputs(
            filter: {createdBy: {eq: $username}}
          ) {
            items {
              form {
                name
                description
                inputKey
              }
              id
              createdAt
            }
          }
        }
      `,
        { username }
      )
    )) as GraphQLResult<ListSurveyInputsQuery>;
    console.log(result);
    setCreatedSurveyInputs(
      (result.data?.listSurveyInputs?.items as unknown) as Input[]
    );
  };

  return (
    <React.Fragment>
      <div className={classes.header}>
        <Typography variant="h4" align="center" component="h1" gutterBottom>
          Survey Dashboard
        </Typography>
        <Typography
          variant="h5"
          align="center"
          component="h2"
          gutterBottom
        ></Typography>
        <Typography paragraph align="center">
          The survey forms you have created and answered will be displayed here.
        </Typography>
      </div>
      <div className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography variant="h5" component="h2" gutterBottom>
            Your answered survey posts
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Desctiption</TableCell>
                <TableCell>Your answer</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {createdSurveyInputs?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.form.name}</TableCell>
                  <TableCell>{item.form.description}</TableCell>
                  <TableCell>
                    <Link to={"input/" + item.form.inputKey}>click me</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <Paper className={classes.paper}>
          <Typography variant="h5" component="h2" gutterBottom>
            Your created Survey Forms
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Desctiption</TableCell>
                <TableCell>Form</TableCell>
                <TableCell>Results</TableCell>
                <TableCell>Anser by yourself</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {createdSurveyForms?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Link to={"update/" + item.id}>click me</Link>
                  </TableCell>
                  <TableCell>
                    <Link to={"results/" + item.resultKey}>click me</Link>
                  </TableCell>
                  <TableCell>
                    <Link to={"input/" + item.inputKey}>click me</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    </React.Fragment>
  );
};

export default SurveyDashboard;
