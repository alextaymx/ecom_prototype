import * as React from "react";
import { Fragment, useCallback, FC } from "react";
import classnames from "classnames";
import {
  BulkDeleteButton,
  List,
  ListProps,
  BulkActionProps,
  Datagrid,
  EditButton,
  TextField,
} from "react-admin";
import { Route, RouteChildrenProps, useHistory } from "react-router-dom";
import { Drawer, useMediaQuery, Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import BulkAcceptButton from "./BulkAcceptButton";
import BulkRejectButton from "./BulkRejectButton";
// import ReviewListMobile from "./ReviewListMobile";
import UserListDesktop from "./UserListDesktop";
import UserFilter from "./UserFilter";
import UserEdit from "./UserEdit";
import { PermissionConstant } from "../../constants";

const ReviewsBulkActionButtons = (props: BulkActionProps) => (
  <Fragment>
    <BulkAcceptButton {...props} />
    <BulkRejectButton {...props} />
    <BulkDeleteButton {...props} />
  </Fragment>
);

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  list: {
    flexGrow: 1,
    transition: theme.transitions.create(["all"], {
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
  listWithDrawer: {
    marginRight: 400,
  },
  drawerPaper: {
    zIndex: 100,
  },
}));

const UserList: FC<ListProps> = ({ permissions, ...props }) => {
  const classes = useStyles();
  const isXSmall = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down("xs")
  );
  const history = useHistory();

  const handleClose = useCallback(() => {
    history.push("/users");
  }, [history]);
  return (
    <div className={classes.root}>
      <Route path="/users/:id">
        {({ match }: RouteChildrenProps<{ id: string }>) => {
          const isMatch = !!(
            match &&
            match.params &&
            match.params.id !== "create" &&
            permissions &&
            permissions.includes(PermissionConstant.Update_User)
          );

          return (
            <Fragment>
              <List
                {...props}
                className={classnames(classes.list, {
                  [classes.listWithDrawer]: isMatch,
                })}
                title="List of users"
                // bulkActionButtons={<ReviewsBulkActionButtons />}
                // filters={<ReviewFilter />}
                // perPage={25}
                // sort={{ field: "date", order: "DESC" }}
              >
                {isXSmall ? (
                  //   <ReviewListMobile />
                  <UserListDesktop
                    selectedRow={
                      isMatch
                        ? parseInt((match as any).params.id, 10)
                        : undefined
                    }
                  />
                ) : (
                  <UserListDesktop
                    selectedRow={
                      isMatch
                        ? parseInt((match as any).params.id, 10)
                        : undefined
                    }
                  />
                )}
              </List>
              <Drawer
                variant="persistent"
                open={isMatch}
                anchor="right"
                onClose={handleClose}
                classes={{
                  paper: classes.drawerPaper,
                }}
              >
                {isMatch ? (
                  <UserEdit
                    id={(match as any).params.id}
                    onCancel={handleClose}
                    {...props}
                  />
                ) : null}
              </Drawer>
            </Fragment>
          );
        }}
      </Route>
    </div>
  );
};

export default UserList;
