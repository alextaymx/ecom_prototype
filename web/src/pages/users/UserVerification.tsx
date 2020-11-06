import * as React from "react";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Field, withTypes } from "react-final-form";
import { useHistory, useLocation } from "react-router-dom";

import {
  Avatar,
  Button,
  Card,
  CardActions,
  CircularProgress,
  TextField,
} from "@material-ui/core";
import { createMuiTheme, makeStyles } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
// import LockIcon from "@material-ui/icons/Lock";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import {
  Notification,
  useDataProvider,
  useMutation,
  useNotify,
} from "react-admin";

import { lightTheme } from "../themes";

import { useRegisterMutation } from "../../generated/graphql";
import { ACTIONS } from "../../dataProvider/actions";

const useStyles = makeStyles((theme) => ({
  main: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "flex-start",
    background: "url(https://source.unsplash.com/random/1600x900)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },
  card: {
    minWidth: 300,
    marginTop: "6em",
  },
  avatar: {
    margin: "1em",
    display: "flex",
    justifyContent: "center",
  },
  icon: {
    backgroundColor: theme.palette.secondary.main,
  },
  hint: {
    marginTop: "1em",
    display: "flex",
    justifyContent: "center",
    color: theme.palette.grey[500],
  },
  form: {
    padding: "0 1em 1em 1em",
  },
  input: {
    marginTop: "1em",
  },
  actions: {
    padding: "0 1em 1em 1em",
  },
}));

interface FormValues {
  username?: string;
  password?: string;
  email?: string;
}

const { Form } = withTypes<FormValues>();

const UserVerification = (props) => {
  // const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const notify = useNotify();
  // const login = useLogin();
  // const location = useLocation<{ nextPathname: string } | null>();
  const history = useHistory();
  const dataProvider = useDataProvider();

  const [verificationStatus, setVerificationStatus] = useState(false);
  // console.log("alex", props.match.params);
  // console.log(dataProvider);
  const [approveUser, { loading }] = useMutation(
    {
      type: ACTIONS.approveUser,
      resource: "users",
      payload: { token: props.match.params.token },
    },
    {
      action: ACTIONS.approveUser,
      onSuccess: ({ data }) => {
        setVerificationStatus(true);
        notify("User approved success", "info", {}, true);
      },
      onFailure: (error) => notify(`Error: ${error.message}`, "warning"),
    }
  );
  useEffect(() => {
    approveUser();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader">Loading...</div>
      </div>
    );
  }
  return (
    <div className={classes.main}>
      <Card className={classes.card}>
        <div className={classes.avatar}>
          <Avatar className={classes.icon}>
            {verificationStatus ? <CheckIcon /> : <CloseIcon />}
          </Avatar>
        </div>
        <div className={classes.hint}>
          Verification {verificationStatus ? "successful" : "failed"}
        </div>
        <div className={classes.form}></div>
        {verificationStatus ? (
          <CardActions className={classes.actions}>
            <Button
              variant="contained"
              type="button"
              color="primary"
              disabled={loading}
              fullWidth
              onClick={() => {
                history.push("/login");
              }}
            >
              Login now !
            </Button>
          </CardActions>
        ) : (
          <span />
        )}
      </Card>
      <Notification />
    </div>
  );
};

UserVerification.propTypes = {
  authProvider: PropTypes.func,
  previousRoute: PropTypes.string,
};

// We need to put the ThemeProvider decoration in another component
// Because otherwise the useStyles() hook used in Login won't get
// the right theme
const UserVerificationWithTheme = (props: any) => (
  <ThemeProvider theme={createMuiTheme(lightTheme)}>
    <UserVerification {...props} />
  </ThemeProvider>
);

export default UserVerificationWithTheme;
