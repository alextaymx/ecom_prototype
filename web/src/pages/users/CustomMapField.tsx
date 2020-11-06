import * as React from "react";
import { FC } from "react";
import Icon from "@material-ui/icons/Stars";
import { makeStyles } from "@material-ui/core/styles";
import Chip from "@material-ui/core/Chip";
import { FieldProps, SingleFieldList } from "react-admin";
import { UserStatusMap, PermissionMap, RoleMap } from "../../constants";

const useStyles = makeStyles({
  // root: {
  //   opacity: 0.87,
  //   whiteSpace: "nowrap",
  //   // display: "flex",
  // },
  main: {
    display: "flex",
    flexWrap: "wrap",
    marginTop: -8,
    marginBottom: -8,
  },
  chip: { margin: 4 },
});

const CustomMapField: FC<FieldProps> = ({ record = {}, source }) => {
  const classes = useStyles();
  return record && record[source] ? (
    <span className={classes.main}>
      {source === "status" && UserStatusMap[record[source]]}
      {source === "role" &&
        Object.keys(RoleMap).find(
          (role) => RoleMap[role]["id"] === record[source]
        )}
      {source === "permissions" &&
        record[source].map((item, idx) => (
          //   <li key={idx}>{item}</li>
          //   <Chip key={idx} label={item} />
          <Chip
            key={idx}
            label={PermissionMap[item]}
            size="small"
            className={classes.chip}
          />
        ))}
    </span>
  ) : null;
};

CustomMapField.defaultProps = {
  label: "Status",
  source: "status",
  addLabel: true,
};

export default CustomMapField;
