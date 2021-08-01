//In your react App.js or yourComponent.js file add these lines to import
import * as Survey from "survey-react";
import "survey-react/survey.css";
import "./spreadsheetwidget";
import "jsuites/dist/jsuites.css";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jspreadsheet-ce/dist/jspreadsheet.theme.css";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { createSurveyForm, updateSurveyForm } from "./graphql/mutations";
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
  CircularProgress,
  Backdrop,
  Snackbar,
  TableBody,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Box,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import AddBoxIcon from "@material-ui/icons/AddBox";
import CloseIcon from "@material-ui/icons/Close";
import { Link, useParams } from "react-router-dom";
import { getSurveyForm } from "./graphql/queries";
import { GetSurveyFormQuery } from "./API";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { useDropzone } from "react-dropzone";
import SplitButton from "./utils/SplitButton";

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
  dropdown: {
    isRequired: true,
    choices: ["None", "Nissan", "BMW", "Toyota"],
  },
  select2: {
    renderAs: "select2",
    isRequired: true,
    choices2: [
      "None",
      { value: "Nissan", group: "Japan" },
      { value: "BMW", group: "others" },
      { value: "Toyota", group: "Japan" },
    ],
  },
  tagbox: {
    isRequired: true,
    choices2: [
      "None",
      { value: "Nissan", group: "Japan" },
      { value: "BMW", group: "others" },
      { value: "Toyota", group: "Japan" },
    ],
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
  { key: "dropdown", type: "dropdown", value: "Dropdown" },
  { key: "select2", type: "dropdown", value: "Select2" },
  { key: "tagbox", type: "tagbox", value: "Tagbox" },
  { key: "checkbox", type: "checkbox", value: "Checkbox" },
  { key: "boolean", type: "boolean", value: "Yes/No" },
  { key: "table", type: "spreadsheet", value: "Table" },
  { key: "spreadsheet", type: "spreadsheet", value: "Spreadsheet" },
];

// Reference
// https://github.com/hmarggraff/react-material-ui-table-row-drag-and-drop

// a little function to help us with reordering the result
const reorder = (list: Component[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: 5,

  // change background colour if dragging
  background: isDragging ? "lightgrey" : "white",

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "lightblue" : "white",
});

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
  const [error, setError] = useState<boolean>(false);

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
      const componentList = modelToComponentList(
        JSON.parse(form.model).elements as []
      );
      updateModel(componentList);
      setFormState({ ...form } as Form);
    }
  };

  const modelToComponentList = (model: []) =>
    model.map(
      (el) =>
        createComponent(JSON.stringify(el, null, "  ")) ??
        ({
          type: "?",
          title: "?",
          name: "?",
          content: JSON.stringify(el),
        } as Component)
    );

  const setInput = (key: string, value: string | null) => {
    setFormState({ ...formState, [key]: value });
  };

  const handleButtonClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    index: number
  ) => {
    switch (index) {
      case 0:
        createSurvey();
        break;
      case 1:
        exportForm();
        break;
    }
  };

  const createSurvey = async () => {
    try {
      setLoading(true);
      if (formID) {
        const input = {
          id: formID,
          name: formState.name,
          description: formState.description,
          model: formState.model,
        };
        await API.graphql(graphqlOperation(updateSurveyForm, { input }));
        window.location.reload();
      } else {
        const input: Form = {
          ...formState,
          inputKey: uuid.v4(),
          resultKey: uuid.v4(),
        };
        const result = await API.graphql(
          graphqlOperation(createSurveyForm, { input })
        );
        const id = (result as any).data.createSurveyForm.id;
        window.location.href = `/update/${id}`;
      }
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
          return (
            createComponent(event.target.value) ??
            ({ ...comp, content: event.target.value } as Component) // invalid JSON format onTextChange
          );
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
      const name = model.name as string;
      return { content, type, title, name } as Component;
    } catch (e) {}
  };

  const updateModel = (newComponentList: Component[]) => {
    setComponentList(newComponentList);
    setError(false);
    setInput(
      "model",
      newComponentList.length === 0
        ? null
        : JSON.stringify({
            elements: newComponentList.map((comp) => {
              try {
                return JSON.parse(comp.content);
              } catch (e) {
                setError(true);
                return { error: true, type: "html", html: `ERROR: ${e}` };
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

  const onDragEnd = (result: DropResult) => {
    console.log(result, componentList);
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      componentList,
      result.source.index,
      result.destination.index
    );

    updateModel(items);
  };

  // yaml file drag & drop
  const {
    acceptedFiles,
    getRootProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({ accept: "application/json" });

  const fileDragStyle = useMemo(
    () => ({
      ...(isDragActive
        ? {
            background: "lightgray",
          }
        : {}),
      ...(isDragAccept
        ? {
            background: "lightgray",
          }
        : {}),
      ...(isDragReject
        ? {
            background: "#ff1744",
          }
        : {}),
    }),
    [isDragActive, isDragAccept, isDragReject]
  );

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        if (reader.result) {
          const data = JSON.parse(reader.result as string);
          const name = data["name"];
          const description = data["description"];
          const model = JSON.stringify(data.model);
          const elements: [] = JSON.parse(model).elements;
          console.log(elements);
          const componentList = modelToComponentList(elements);
          updateModel(componentList);
          setFormState({ ...formState, name, description, model });
        }
      };
      reader.readAsText(file, "utf-8");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedFiles]);

  // export form
  const exportForm = async () => {
    const data = {
      name: formState.name,
      description: formState.description,
      model: formState.model ? JSON.parse(formState.model) : null,
    };
    const fileName = data.name;
    const json = JSON.stringify(data, null, "  ");
    const blob = new Blob([json], { type: "application/json" });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const createFormEditRow = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {componentList.map((comp, index) => (
              <React.Fragment>
                <Draggable
                  key={comp.name}
                  draggableId={comp.name}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <Paper
                        style={{
                          display: "grid",
                          gridTemplateColumns: "30px 1fr 64px 64px",
                          gridTemplateRows: "64px",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gridColumn: 1,
                          }}
                        >
                          {index + 1}
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gridColumn: 2,
                          }}
                        >
                          {comp.title}
                        </span>
                        <IconButton
                          style={{ gridColumn: 3 }}
                          aria-label="edit"
                          onClick={() =>
                            setEditorOpen(editorOpen === index ? null : index)
                          }
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          style={{ gridColumn: 4 }}
                          aria-label="delete"
                          onClick={() =>
                            updateModel(
                              componentList.filter((c, i) => i !== index)
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                      <Collapse
                        in={editorOpen === index}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box margin={1}>
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
                        </Box>
                      </Collapse>
                    </div>
                  )}
                </Draggable>
              </React.Fragment>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );

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
        <Paper
          className={classes.paper}
          {...getRootProps({ style: fileDragStyle })}
        >
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
            <TableBody></TableBody>
          </Table>

          {createFormEditRow()}

          <div className={classes.buttons}>
            <SplitButton
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={
                error ||
                loading ||
                !formState.name ||
                !formState.description ||
                !formState.model
              }
              onClick={handleButtonClick}
            >
              {[`${formID ? "Update" : "Create"} Survey`, "Export Form"]}
            </SplitButton>
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
          <Typography
            paragraph
            align="center"
            gutterBottom
            style={{ whiteSpace: "pre-line" }}
          >
            {formState.description}
          </Typography>
          <Survey.Survey json={formState.model ?? "{}"} mode="display" />
        </Paper>
      </div>
    </React.Fragment>
  );
};

export default SurveyForm;
