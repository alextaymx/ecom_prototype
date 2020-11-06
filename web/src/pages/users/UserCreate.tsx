import * as React from "react";
import { FC } from "react";
import {
  Create,
  CreateProps,
  SimpleForm,
  TextInput,
  PasswordInput,
  required,
  email,
} from "react-admin";
import { AnyObject } from "react-final-form";
import { Typography, Box } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Styles } from "@material-ui/styles/withStyles";

export const styles: Styles<Theme, any> = {
  name: { display: "inline-block" },
  //   last_name: { display: "inline-block", marginLeft: 32 },
  email: { width: 544 },
  password: { display: "inline-block" },
  confirm_password: { display: "inline-block", marginLeft: 32 },
};

const useStyles = makeStyles(styles);

export const validatePasswords = ({
  password,
  confirm_password,
}: AnyObject) => {
  const errors = {} as any;

  if (password && confirm_password && password !== confirm_password) {
    errors.confirm_password = ["Password mismatch"];
  }

  return errors;
};

const UserCreate: FC<CreateProps> = (props) => {
  const classes = useStyles();

  return (
    <Create {...props}>
      <SimpleForm validate={validatePasswords}>
        <SectionTitle label="Identity" />
        <TextInput
          autoFocus
          source="name"
          formClassName={classes.name}
          validate={requiredValidate}
        />
        <TextInput
          type="email"
          source="email"
          validation={{ email: true }}
          fullWidth
          formClassName={classes.email}
          validate={[required(), email()]}
        />
        <Separator />
        <SectionTitle label="Password" />
        <PasswordInput source="password" formClassName={classes.password} />
        <PasswordInput
          source="confirm_password"
          formClassName={classes.confirm_password}
        />
      </SimpleForm>
    </Create>
  );
};

const requiredValidate = [required()];

const SectionTitle = ({ label }: { label: string }) => {
  return (
    <Typography variant="h6" gutterBottom>
      {label}
    </Typography>
  );
};

const Separator = () => <Box pt="1em" />;

export default UserCreate;
