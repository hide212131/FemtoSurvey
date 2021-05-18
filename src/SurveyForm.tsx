//In your react App.js or yourComponent.js file add these lines to import
import * as Survey from "survey-react";
import "survey-react/survey.css";
import "./spreadsheetwidget";
import "jsuites/dist/jsuites.css";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jspreadsheet-ce/dist/jspreadsheet.theme.css";
import React, { ChangeEvent, useEffect, useState } from "react";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { createSurveyForm } from "./graphql/mutations";
import * as uuid from "uuid";
import {
  FormControl,
  Grid,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  InputLabel,
  Collapse,
  Button,
  CircularProgress,
  Backdrop,
  Snackbar,
  TableBody,
  Table,
  TableHead,
  TableRow,
  TableCell,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddBoxIcon from "@material-ui/icons/AddBox";
import CloseIcon from "@material-ui/icons/Close";
import { Link, useParams } from "react-router-dom";
import { getSurveyForm } from "./graphql/queries";
import { GetSurveyFormQuery } from "./API";
//Define Survey JSON
//Here is the simplest Survey with one text question
const useStyles = makeStyles((theme) => ({
  header: {
    marginTop: theme.spacing(2),
  },
  layout: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
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
    minWidth: 120,
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
  name?: string;
  description?: string;
  model?: string;
  inputKey?: string;
  resultKey?: string;
}

interface Component {
  type: string;
  name: string;
  title: string;
  content: string;
}

interface StringKeyObject {
  [key: string]: any;
}

const template: StringKeyObject = {
  table: {
    jspreadsheetProperties: {
      columns: [
        { title: "Name", width: 300, name: "name" },
        { title: "Value", width: 80, name: "value" },
        { title: "Etc", width: 100, name: "etc" },
      ],
    },
  },
  spreadsheet: {
    jspreadsheetProperties: {
      minDimensions: [10, 5],
    },
  },
  text: {
    isRequired: true,
  },
  comment: {
    isRequired: true,
  },
  radiogroup: {
    isRequired: true,
    colCount: 4,
    choices: ["None", "Nissan", "BMW", "Toyota"],
  },
  checkbox: {
    isRequired: true,
    colCount: 4,
    choices: ["None", "Nissan", "BMW", "Toyota"],
  },
  boolean: {
    isRequired: true,
  },
};

const compKeySelect: Array<{ key: string; type: string; value: string }> = [
  { key: "text", type: "text", value: "TextField" },
  { key: "comment", type: "comment", value: "MultilineText" },
  { key: "radiogroup", type: "radiogroup", value: "RadioGroup" },
  { key: "checkbox", type: "checkbox", value: "Checkbox" },
  { key: "boolean", type: "boolean", value: "Yes/No" },
  { key: "table", type: "spreadsheet", value: "Table" },
  { key: "spreadsheet", type: "spreadsheet", value: "Spreadsheet" },
];

const SurveyForm = () => {
  const classes = useStyles();
  console.log("SurveyModel start");
  const { formID } = useParams<{ formID: string | undefined }>();
  const [formState, setFormState] = useState<Form>({});
  const [compKey, setCompKey] = useState<string>("text");
  const [compTitle, setCompTitle] = useState<string>();
  const [componentList, setComponentList] = useState<Component[]>([]);
  const [editorOpen, setEditorOpen] = useState<number | null>(null);
  const [keyNumber, setKeyNumber] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>();

  useEffect(() => {
    if (formID) {
      fetchForm();
    }

    Auth.currentAuthenticatedUser({
      bypassCache: false, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    })
      .then((user) => {
        setInput("createdBy", user.username);
      })
      .catch((err) => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchForm = async () => {
    const result = (await API.graphql(
      graphqlOperation(getSurveyForm, { id: formID })
    )) as GraphQLResult<GetSurveyFormQuery>;

    console.log("fetch reslt", { formID, result });
    const form = result.data?.getSurveyForm;
    if (form) {
      const componentList = (JSON.parse(form.model).elements as []).map(
        (el) =>
          createComponent(JSON.stringify(el, null, "  ")) ??
          ({
            type: "?",
            title: "?",
            name: "?",
            content: JSON.stringify(el),
          } as Component)
      );
      updateModel(componentList);
      setFormState({ ...form } as Form);
    }
  };

  const setInput = (key: string, value: string | null) => {
    setFormState({ ...formState, [key]: value });
  };

  const createSurvey = async () => {
    try {
      setLoading(true);
      const input: Form = {
        ...formState,
        inputKey: uuid.v4(),
        resultKey: uuid.v4(),
      };
      await API.graphql(graphqlOperation(createSurveyForm, { input }));
      setMessage("success");
    } catch (err) {
      console.log(err);
      setMessage("error creating survey:" + err.errors);
    } finally {
      setLoading(false);
    }
  };

  const onTextChange = (
    event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    index: number
  ) => {
    updateModel(
      componentList.map((comp, i) => {
        if (i === index) {
          return createComponent(event.target.value) ?? comp;
        } else {
          return comp;
        }
      })
    );
  };

  const createComponent = (content: string): Component | undefined => {
    try {
      // try parsing -> title, type
      const model: any = JSON.parse(content);
      const title = model.title as string;
      const type = model.type as string;
      return { content, type, title } as Component;
    } catch (e) {}
  };

  const updateModel = (newComponentList: Component[]) => {
    setComponentList(newComponentList);
    setInput(
      "model",
      newComponentList.length === 0
        ? null
        : JSON.stringify({
            elements: newComponentList.map((comp) => {
              try {
                return JSON.parse(comp.content);
              } catch (e) {
                return {};
              }
            }),
          })
    );
  };

  const onAddClick = () => {
    const key = compKey ?? "text";
    const type = compKeySelect.find((c) => c.key === key)?.type ?? "text";
    const name = createName(type);
    const title = compTitle ?? "(Please write down your question.)";
    const content = JSON.stringify(
      { type, name, title, ...template[key] },
      null,
      "  "
    );
    updateModel([
      ...componentList,
      { type, name, title, content } as Component,
    ]);
  };

  const createName = (compType: string): string | null => {
    for (let i = 1; i <= 100; i++) {
      // try 10 count...
      const newNumber = keyNumber + i;
      const name = compType + String(newNumber);
      const dupulicate = componentList.find((com) => com.name === name);
      if (!dupulicate) {
        setKeyNumber(newNumber);
        return name;
      }
    }
    return null;
  };

  const handleClose = () => {
    setMessage(null);
  };

  return (
    <React.Fragment>
      <div className={classes.header}>
        <Typography variant="h4" align="center" component="h1" gutterBottom>
          {formID ? "View/Update" : "Create"} Survey
        </Typography>
        <Typography
          variant="h5"
          align="center"
          component="h2"
          gutterBottom
        ></Typography>
        <Typography paragraph align="center">
          Write a title and description, add or update elements of the form, and
          create your own survey form.
        </Typography>
      </div>
      <div className={classes.layout}>
        {formID ? (
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Access Keys
            </Typography>
            <Typography paragraph>
              The following keys have been generated Please make them available
              only to trusted people.
            </Typography>
            <Table>
              <TableHead>
                <TableCell>KEY</TableCell>
                <TableCell>DESCRIPTION</TableCell>
                <TableCell>URL</TableCell>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>INPUT KEY</TableCell>
                  <TableCell>
                    Key to tell only those who can answer the survey.
                  </TableCell>
                  <TableCell>
                    <Link to={"/input/" + formState.inputKey}>
                      {window.location.origin + "/input/" + formState.inputKey}
                    </Link>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>RESULTS KEY</TableCell>
                  <TableCell>
                    Key to tell only those who can see the survey list.
                  </TableCell>
                  <TableCell>
                    <Link to={"/results/" + formState.resultKey}>
                      {window.location.origin +
                        "/results/" +
                        formState.resultKey}
                    </Link>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        ) : (
          <React.Fragment></React.Fragment>
        )}
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            {formID ? "Exists" : "New"} survey form
          </Typography>
          <Grid item xs={12}>
            <TextField
              required
              id="title"
              name="title"
              label="Title"
              fullWidth
              value={formState.name}
              onChange={(e) => setInput("name", e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="description"
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formState.description}
              onChange={(e) => setInput("description", e.target.value)}
            />
          </Grid>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TextField
                    required
                    id="compTitle"
                    name="compTitle"
                    label="Fill in your question"
                    fullWidth
                    value={compTitle}
                    onChange={(e) => {
                      setCompTitle(e.target.value as string);
                    }}
                  />
                </TableCell>
                <TableCell>
                  <FormControl className={classes.formControl} fullWidth>
                    <InputLabel id="select-component-type">Type</InputLabel>
                    <Select
                      className={classes.select}
                      labelId="select-component-type"
                      id="select-component"
                      value={compKey}
                      onChange={(e) => setCompKey(e.target.value as string)}
                    >
                      {compKeySelect.map((item, index) => (
                        <MenuItem value={item.key} selected={index === 0}>
                          {item.value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Tooltip title="Add Component" aria-label="add">
                    <IconButton onClick={onAddClick}>
                      <AddBoxIcon fontSize="large" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {componentList.map((comp, index) => {
                return (
                  <React.Fragment>
                    <TableRow>
                      <TableCell colSpan={2}>{`${index + 1}.${
                        comp.title
                      }`}</TableCell>
                      <TableCell>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() =>
                            setEditorOpen(editorOpen === index ? null : index)
                          }
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() =>
                            updateModel(
                              componentList.filter((c, i) => i !== index)
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <Collapse
                      in={editorOpen === index}
                      timeout="auto"
                      unmountOnExit
                    >
                      <TextField
                        required
                        id={"editor" + index}
                        name={"editor" + index}
                        label={"editor" + index}
                        fullWidth
                        multiline
                        rows={10}
                        value={comp.content}
                        onChange={(e) => onTextChange(e, index)}
                      />
                    </Collapse>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
          <div className={classes.buttons}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={
                loading ||
                !formState.name ||
                !formState.description ||
                !formState.model
              }
              onClick={createSurvey}
            >
              create survey
            </Button>
            <Backdrop className={classes.backdrop} open={loading}>
              <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              open={message ? true : false}
              autoHideDuration={5000}
              onClose={handleClose}
              message={message}
              action={
                <React.Fragment>
                  <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={handleClose}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
            />
          </div>
        </Paper>
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            Form Preview
          </Typography>
          <Typography variant="h5" align="center" component="h1" gutterBottom>
            {formState.name}
          </Typography>
          <Typography paragraph align="center" gutterBottom>
            {formState.description}
          </Typography>
          <Survey.Survey json={formState.model ?? "{}"} mode="display" />
        </Paper>
      </div>
    </React.Fragment>
  );
};

export default SurveyForm;
