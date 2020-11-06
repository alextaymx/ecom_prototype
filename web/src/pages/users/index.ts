import PeopleIcon from "@material-ui/icons/People";
import UserCreate from "./UserCreate";
import UserList from "./UserList";

const resource = {
  icon: PeopleIcon,
  list: UserList,
  create: JSON.parse(localStorage.getItem("user")).permissions.includes("1")
    ? UserCreate
    : null,
};

export default resource;
