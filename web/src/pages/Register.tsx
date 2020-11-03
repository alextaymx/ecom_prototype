import * as React from "react";
import { useState } from "react";
import PropTypes from "prop-types";
import { Field, withTypes } from "react-final-form";
import { useHistory } from "react-router-dom";

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
import CreateIcon from "@material-ui/icons/Create";
import { Notification, useNotify } from "react-admin";

import { lightTheme } from "./themes";

import { errorMonitor } from "events";
import { useRegisterMutation } from "../generated/graphql";

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

const renderInput = ({
  meta: { touched, error } = { touched: false, error: undefined },
  input: { ...inputProps },
  ...props
}) => (
  <TextField
    error={!!(touched && error)}
    helperText={touched && error}
    {...inputProps}
    {...props}
    fullWidth
  />
);

interface FormValues {
  username?: string;
  password?: string;
  email?: string;
}

const { Form } = withTypes<FormValues>();

const Register = () => {
  const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const notify = useNotify();
  // const login = useLogin();
  // const location = useLocation<{ nextPathname: string } | null>();
  const history = useHistory();
  const [registerMutation] = useRegisterMutation();
  const handleSubmit = async (auth: FormValues) => {
    setLoading(true);
    try {
      const response = await registerMutation({
        variables: {
          options: {
            email: auth.email,
            password: auth.password,
            name: auth.username,
          },
        },
        //   update: (cache, { data }) => {
        //     cache.writeQuery<MeQuery>({
        //       query: MeDocument,
        //       data: {
        //         __typename: "Query",
        //         me: data?.login.user,
        //       },
        //     });
        //     cache.evict({ fieldName: "posts:{}" });
        //   },
      });
      console.log(response);
      if (response.data?.register.errors) {
        const error = response.data?.register.errors[0];
        notify(
          typeof error === "string"
            ? error
            : typeof error === "undefined" || !error.message
            ? "ra.auth.sign_in_error"
            : `${error.field} field: ${error.message}`,
          "warning"
        );
      } else if (response.data?.register.user) {
        localStorage.setItem("username", response.data?.register.user.name);
        notify("Registered ! Please confirm your email ! ");
        history.push("/login");
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const validate = (values: FormValues) => {
    const errors: FormValues = {};
    if (!values.username) {
      errors.username = "Required";
    }
    if (!values.password) {
      errors.password = "Required";
    }
    if (!values.email) {
      errors.email = "Required";
    }
    return errors;
  };

  return (
    <Form
      onSubmit={handleSubmit}
      validate={validate}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit} noValidate>
          <div className={classes.main}>
            <Card className={classes.card}>
              <div className={classes.avatar}>
                <Avatar className={classes.icon}>
                  <CreateIcon />
                </Avatar>
              </div>
              <div className={classes.hint}>Registration Form</div>
              <div className={classes.form}>
                <div className={classes.input}>
                  <Field
                    autoFocus
                    name="username"
                    // @ts-ignore
                    component={renderInput}
                    label="Username"
                    disabled={loading}
                  />
                </div>
                <div className={classes.input}>
                  <Field
                    autoFocus
                    name="email"
                    // @ts-ignore
                    component={renderInput}
                    label="Email"
                    disabled={loading}
                  />
                </div>
                <div className={classes.input}>
                  <Field
                    name="password"
                    // @ts-ignore
                    component={renderInput}
                    label="Password"
                    type="password"
                    disabled={loading}
                  />
                </div>
              </div>
              <CardActions className={classes.actions}>
                <Button
                  variant="contained"
                  type="submit"
                  color="primary"
                  disabled={loading}
                  fullWidth
                >
                  {loading && <CircularProgress size={25} thickness={2} />}
                  Sign up
                </Button>
              </CardActions>
              <CardActions className={classes.actions}>
                <Button
                  variant="contained"
                  type="button"
                  color="secondary"
                  disabled={loading}
                  fullWidth
                  onClick={() => {
                    history.push("/login");
                  }}
                >
                  Login
                </Button>
              </CardActions>
            </Card>
            <Notification />
          </div>
        </form>
      )}
    />
  );
};

Register.propTypes = {
  authProvider: PropTypes.func,
  previousRoute: PropTypes.string,
};

// We need to put the ThemeProvider decoration in another component
// Because otherwise the useStyles() hook used in Login won't get
// the right theme
const RegisterWithTheme = (props: any) => (
  <ThemeProvider theme={createMuiTheme(lightTheme)}>
    <Register {...props} />
  </ThemeProvider>
);

export default RegisterWithTheme;
