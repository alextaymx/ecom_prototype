import PeopleIcon from "@material-ui/icons/People";
import { PermissionConstant } from "../../constants";
import UserCreate from "./UserCreate";
import UserList from "./UserList";

const resource = {
  icon: PeopleIcon,
  list: UserList,
  create: UserCreate,
};

export default resource;
