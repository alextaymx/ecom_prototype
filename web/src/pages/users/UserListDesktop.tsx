import * as React from "react";
import { FC } from "react";
import {
  Identifier,
  Datagrid,
  DateField,
  TextField,
  DatagridProps,
  EmailField,
  usePermissions,
} from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import Chip from "@material-ui/core/Chip";

// import ProductReferenceField from '../products/ProductReferenceField';
// import CustomerReferenceField from '../visitors/CustomerReferenceField';
import rowStyle from "./rowStyle";
import CustomMapField from "./CustomMapField";
import { PermissionConstant } from "../../constants";

const PermissionsField = ({ source, record = {} }) => (
  <>
    {record[source] &&
      record[source].map((item, idx) => (
        //   <li key={idx}>{item}</li>
        //   <Chip key={idx} label={item} />
        <Chip key={idx} label={item} />
      ))}
  </>
);
PermissionsField.defaultProps = {
  addLabel: true,
};
const useListStyles = makeStyles({
  headerRow: {
    borderLeftColor: "white",
    borderLeftWidth: 5,
    borderLeftStyle: "solid",
  },
  headerCell: {
    padding: "6px 8px 6px 8px",
  },
  rowCell: {
    padding: "6px 8px 6px 8px",
  },
});

export interface ReviewListDesktopProps extends DatagridProps {
  selectedRow?: Identifier;
}

const UserListDesktop: FC<ReviewListDesktopProps> = ({
  selectedRow,
  ...props
}) => {
  const classes = useListStyles();
  const { permissions } = usePermissions();
  return (
    <Datagrid
      rowClick={
        permissions && permissions.includes(PermissionConstant.Update_User)
          ? "edit"
          : ""
      }
      // @ts-ignore
      rowStyle={rowStyle(selectedRow)}
      classes={{
        headerRow: classes.headerRow,
        headerCell: classes.headerCell,
        rowCell: classes.rowCell,
      }}
      optimized
      {...props}
    >
      <TextField source="id" />
      <TextField source="name" />
      <EmailField source="email" />
      {/* <TextField source="status" />
      <TextField source="role" /> */}
      {/* <PermissionsField source="permissions" /> */}
      <CustomMapField source="status" />
      <CustomMapField source="role" label="Role" />
      <CustomMapField
        source="permissions"
        label="Permissions"
        // cellClassName={classes.permissions}
      />
      {/* <ArrayField source="permissions">
        <SingleFieldList>
          <ChipField />
        </SingleFieldList>
      </ArrayField> */}
      {/* <TextField source="permissions" cellClassName={classes.comment} /> */}
      <DateField source="createdAt" />
    </Datagrid>
  );
};

export default UserListDesktop;
