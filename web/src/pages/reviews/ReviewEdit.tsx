import * as React from "react";
import { FC } from "react";
import {
  useEditController,
  useTranslate,
  TextInput,
  SimpleForm,
  DateField,
  EditProps,
  SelectInput,
  SelectArrayInput,
} from "react-admin";
import {
  IconButton,
  Typography,
  Box,
  Card,
  CardContent,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";

// import ProductReferenceField from '../products/ProductReferenceField';
// import CustomerReferenceField from '../visitors/CustomerReferenceField';
import ReviewEditToolbar from "./ReviewEditToolbar";
import { User } from "../types";
import { PermissionMap } from "../../constants";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 40,
  },
  title: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "1em",
  },
  form: {
    [theme.breakpoints.up("xs")]: {
      width: 400,
    },
    [theme.breakpoints.down("xs")]: {
      width: "100vw",
      marginTop: -30,
    },
  },
  inlineField: {
    display: "inline-block",
    width: "50%",
  },
}));

interface Props extends EditProps {
  onCancel: () => void;
}

const ReviewEdit: FC<Props> = ({ onCancel, ...props }) => {
  const classes = useStyles();
  const controllerProps = useEditController<User>(props);
  if (!controllerProps.record) {
    return null;
  }
  console.log(
    Object.keys(PermissionMap).map((key) => ({
      id: parseInt(key) + 20,
      permissionKey: key,
      name: PermissionMap[key],
    }))
  );
  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <Typography variant="h6">
          Review detail
          {/* {translate("resources.reviews.detail")} */}
        </Typography>
        <IconButton onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </div>
      <SimpleForm
        className={classes.form}
        basePath={controllerProps.basePath}
        record={controllerProps.record}
        save={controllerProps.save}
        version={controllerProps.version}
        redirect="list"
        resource="users"
        toolbar={<ReviewEditToolbar />}
      >
        <>
          <Box display={{ xs: "block", sm: "flex" }}>
            <Box flex={1} mr={{ xs: 0, sm: "0.5em" }}>
              <TextInput
                source="name"
                fullWidth
                disabled={controllerProps.record.status === "3"}
              />
            </Box>
            <Box flex={1} ml={{ xs: 0, sm: "0.5em" }}>
              <TextInput
                source="email"
                fullWidth
                disabled={controllerProps.record.status === "3"}
              />
            </Box>
          </Box>
          <Box display={{ xs: "block", sm: "flex" }}>
            <Box flex={1} mr={{ xs: 0, sm: "0.5em" }}>
              <SelectArrayInput
                // label="Tags"
                source="permissions"
                choices={Object.keys(PermissionMap).map((key) => ({
                  id: key,
                  name: PermissionMap[key],
                }))}
                disabled={controllerProps.record.status === "3"}
              />
            </Box>
            <Box flex={1} ml={{ xs: 0, sm: "0.5em" }}>
              <SelectInput
                fullWidth
                source="role"
                choices={[
                  { id: "1", name: "SuperAdmin" },
                  { id: "2", name: "User" },
                ]}
                disabled={controllerProps.record.status === "3"}
              />
            </Box>
          </Box>
        </>
        {/* <Box display={{ xs: "block", sm: "flex" }}>
          <Box flex={1} mr={{ xs: 0, sm: "0.5em" }}>
            <TextInput source="permissions" fullWidth />
          </Box>
          <Box flex={1} ml={{ xs: 0, sm: "0.5em" }}>
            <TextInput source="createdAt" fullWidth />
          </Box>
        </Box> */}
        {/* <TextInput source="id" formClassName={classes.inlineField} />
        <TextInput source="name" formClassName={classes.inlineField} />
        <TextInput source="email" formClassName={classes.inlineField} />
        <TextInput source="status" />
        <TextInput source="role" formClassName={classes.inlineField} />
        <TextInput source="permissions" formClassName={classes.inlineField} />
        <TextInput source="createdAt" formClassName={classes.inlineField} /> */}
      </SimpleForm>
    </div>
  );
};

export default ReviewEdit;
