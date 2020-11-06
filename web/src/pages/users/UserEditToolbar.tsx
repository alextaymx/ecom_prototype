import * as React from "react";
import { Fragment, FC } from "react";
import MuiToolbar from "@material-ui/core/Toolbar";
import { makeStyles } from "@material-ui/core/styles";

import { SaveButton, DeleteButton, ToolbarProps } from "react-admin";
import AcceptButton from "./AcceptButton";
import RejectButton from "./RejectButton";
import { User } from "../types";
import { useUpdate, useNotify, useRedirect } from "react-admin";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    color: "#f44336",
    display: "inline-flex",
    alignItems: "center",
  },
}));

const UserEditToolbar: FC<ToolbarProps<User>> = ({
  basePath,
  handleSubmitWithRedirect,
  invalid,
  record,
  resource,
  saving,
}) => {
  const classes = useStyles();
  const notify = useNotify();
  const redirectTo = useRedirect();

  const [deactivateUser, { loading: deactivateLoading }] = useUpdate(
    "users",
    record.id,
    { id: record.id, status: "3" },
    record,
    {
      undoable: true,
      onSuccess: () => {
        notify("Deactivation Success", "info", {}, true);
        redirectTo("/users");
      },
      onFailure: () => {
        notify("Deactivation Error", "warning");
      },
    }
  );
  const [activateUser, { loading: activateLoading }] = useUpdate(
    "users",
    record.id,
    { id: record.id, status: "1" },
    record,
    {
      undoable: true,
      onSuccess: () => {
        notify("Activation Success", "info", {}, true);
        redirectTo("/users");
      },
      onFailure: () => {
        notify("Activation Error", "warning");
      },
    }
  );

  if (!record) return null;
  return (
    <MuiToolbar className={classes.root}>
      {record.status === "2" && (
        <Fragment>
          <AcceptButton record={record} />
          <RejectButton record={record} />
        </Fragment>
      )}
      <Fragment>
        {record && record.status !== "3" ? (
          <SaveButton
            handleSubmitWithRedirect={handleSubmitWithRedirect}
            invalid={invalid}
            saving={saving}
            redirect="list"
            submitOnEnter={true}
          />
        ) : (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={activateUser}
            disabled={activateLoading}
          >
            Restore User
          </Button>
        )}

        {record && record.status === "1" && (
          <Button
            style={{ color: "#f44336" }}
            variant="outlined"
            onClick={deactivateUser}
            disabled={deactivateLoading}
          >
            Deactivate User
          </Button>
        )}
        {/* <DeleteButton
            basePath={basePath}
            record={record}
            resource={resource}
          /> */}
      </Fragment>
    </MuiToolbar>
  );
};

export default UserEditToolbar;
