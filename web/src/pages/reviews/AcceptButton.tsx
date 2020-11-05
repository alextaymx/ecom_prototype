import * as React from "react";
import { FC } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import ThumbUp from "@material-ui/icons/ThumbUp";
import { useUpdate, useNotify, useRedirect } from "react-admin";
import { User } from "./../types";
import CheckIcon from "@material-ui/icons/Check";

/**
 * This custom button demonstrate using useUpdate to update data
 */
const AcceptButton: FC<{ record: User }> = ({ record }) => {
  const notify = useNotify();
  const redirectTo = useRedirect();

  const [approve, { loading }] = useUpdate(
    "users",
    record.id,
    { id: record.id, status: "1" },
    record,
    {
      undoable: true,
      onSuccess: () => {
        notify("Approved Success", "info", {}, true);
        redirectTo("/users");
      },
      onFailure: () => {
        notify("Approved Error", "warning");
      },
    }
  );
  return record && record.status === "2" ? (
    <Button
      variant="outlined"
      color="primary"
      size="small"
      onClick={approve}
      disabled={loading}
    >
      <CheckIcon
        color="primary"
        style={{ paddingRight: "0.5em", color: "green" }}
      />
      Accept
    </Button>
  ) : (
    <span />
  );
};

AcceptButton.propTypes = {
  record: PropTypes.any,
};

export default AcceptButton;
