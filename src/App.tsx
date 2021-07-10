import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Amplify from "aws-amplify";
import {
  AmplifyAuthenticator,
  AmplifySignIn,
  AmplifySignOut,
  AmplifySignUp,
} from "@aws-amplify/ui-react";
import awsconfig from "./aws-exports";
import SurveyForm from "./SurveyForm";
import SurveyInput from "./SurveyInput";
import SurveyResults from "./SurveyResults";
import {
  AppBar,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  Toolbar,
  Typography,
} from "@material-ui/core";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuIcon from "@material-ui/icons/Menu";
import "./jspreadsheet.css";
import SurveyDashboard from "./SurveyDashboard";
import { Create, Dashboard } from "@material-ui/icons";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Survey from "survey-react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";
import * as widgets from "surveyjs-widgets";
import select2widgets from "./select2widget";

window["$"] = window["jQuery"] = $;
select2widgets(Survey, $);
widgets.select2tagbox(Survey);

const useStyles = makeStyles((theme) => ({
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
  },
  grow: {
    flexGrow: 1,
  },
  container: {
    paddingTop: theme.spacing(8),
  },
}));

Amplify.configure(awsconfig);

const App = () => {
  const classes = useStyles();

  const toggleDrawer = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const list = () => (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button component={Link} to="/create">
          <ListItemIcon>
            <Create />
          </ListItemIcon>
          <ListItemText primary="Create new survey" />
        </ListItem>
      </List>
    </div>
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isProfileMenuOpen = Boolean(anchorEl);
  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <AmplifyAuthenticator usernameAlias="email">
      <AmplifySignUp
        slot="sign-up"
        usernameAlias="email"
        formFields={[
          {
            type: "email",
            label: "email",
            required: true,
          },
          {
            type: "password",
            label: "password",
            required: true,
          },
        ]}
      />
      <AmplifySignIn slot="sign-in" usernameAlias="email" />
      <div>
        <Router>
          <AppBar position="absolute">
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" color="inherit" noWrap>
                FemtoSurvey (prototype)
              </Typography>
              <div className={classes.grow} />
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls="primary-account-menu"
                aria-haspopup="true"
                onClick={handleProfileMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
            {list()}
          </Drawer>

          <main className={classes.container}>
            <Container maxWidth="lg">
              <Switch>
                <Route path="/create/">
                  <SurveyForm />
                </Route>
                <Route path="/update/:formID">
                  <SurveyForm />
                </Route>
                <Route path="/input/:inputKey">
                  <SurveyInput />
                </Route>
                <Route path="/results/:resultKey">
                  <SurveyResults />
                </Route>
                <Route path="/">
                  <SurveyDashboard />
                </Route>
              </Switch>
            </Container>
          </main>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            id="primary-account-menu"
            keepMounted
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={isProfileMenuOpen}
            onClose={handleProfileMenuClose}
          >
            <AmplifySignOut onClick={handleProfileMenuClose} />
          </Menu>
        </Router>
      </div>
    </AmplifyAuthenticator>
  );
};

export default App;
