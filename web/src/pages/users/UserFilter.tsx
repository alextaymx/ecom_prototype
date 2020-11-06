import * as React from "react";
import { FC } from "react";
import {
  AutocompleteInput,
  DateInput,
  Filter,
  ReferenceInput,
  SearchInput,
  SelectInput,
  FilterProps,
} from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import { User } from "../types";

const useFilterStyles = makeStyles({
  status: { width: 150 },
});

const UserFilter: FC<Omit<FilterProps, "children">> = (props) => {
  const classes = useFilterStyles();
  return (
    <Filter {...props}>
      <SearchInput source="q" alwaysOn />
      <SelectInput
        source="status"
        choices={[
          { id: "1", name: "Active" },
          { id: "2", name: "Pending" },
          { id: "3", name: "Inactive" },
        ]}
        className={classes.status}
      />
      {/* <ReferenceInput source="customer_id" reference="customers">
        <AutocompleteInput
          optionText={(choice?: User) =>
            choice?.id // the empty choice is { id: '' }
              ? `${choice.first_name} ${choice.last_name}`
              : ""
          }
        />
      </ReferenceInput> */}
      {/* <ReferenceInput source="product_id" reference="products">
        <AutocompleteInput optionText="reference" />
      </ReferenceInput> */}
      <DateInput source="createdAt" />
      {/* <DateInput source="date_lte" /> */}
    </Filter>
  );
};

export default UserFilter;
