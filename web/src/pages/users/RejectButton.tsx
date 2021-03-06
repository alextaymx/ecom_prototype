import * as React from "react";
import { FC } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import ThumbDown from "@material-ui/icons/ThumbDown";
import { useUpdate, useNotify, useRedirect, usePermissions } from "react-admin";
import { User } from "../types";
import CloseIcon from "@material-ui/icons/Close";
import { PermissionConstant } from "../../constants";

/**
 * This custom button demonstrate using a custom action to update data
 */
const RejectButton: FC<{ record: User }> = ({ record }) => {
  const notify = useNotify();
  const redirectTo = useRedirect();
  const { permissions } = usePermissions();
  const [reject, { loading }] = useUpdate(
    "users",
    record.id,
    { id: record.id, status: "3" },
    record,
    {
      undoable: true,
      onSuccess: () => {
        notify("Rejected Success", "info", {}, true);
        redirectTo("/users");
      },
      onFailure: () => {
        notify("Rejected Error", "warning");
      },
    }
  );

  return permissions &&
    permissions.includes(PermissionConstant.Delete_User) &&
    record &&
    record.status === "2" ? (
    <Button
      variant="outlined"
      color="primary"
      size="small"
      onClick={reject}
      disabled={loading}
    >
      <CloseIcon
        color="primary"
        style={{ paddingRight: "0.5em", color: "red" }}
      />
      Reject
    </Button>
  ) : (
    <span />
  );
};

RejectButton.propTypes = {
  record: PropTypes.any,
};

export default RejectButton;
