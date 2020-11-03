import React, { useEffect, useState } from "react";
import "./App.css";
import { Admin, DataProvider, LegacyDataProvider, Resource } from "react-admin";
// import buildGraphQLProvider from "ra-data-graphql-simple";
// import { createNetworkInterface } from "react-apollo";
// import buildApolloClient, {
//   buildQuery as buildQueryFactory,
// } from "ra-data-graphql-simple";
// import buildGraphQLProvider from "ra-data-graphql-simple";
import buildApolloClient from "ra-data-graphql-simple";
import authProvider from "./authProvider";
import Login from "./pages/Login";
import customRoutes from "./routes";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

import Users from "./pages/reviews";
// import buildQuery from './buildQuery'; // see Specify your queries and mutations section below

const APOLLO_CLIENT = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
  cache: new InMemoryCache(),
});
const getGqlResource = (resource: string) => {
  switch (resource) {
    case "users": {
      return "User";
    }

    case "products":
      return "Product";
    default:
      throw new Error(`Unknown resource ${resource}`);
  }
};
const myDataProvider = () =>
  buildApolloClient({
    clientOptions: {
      uri: "http://localhost:4000/graphql",
    },
  }).then(
    (dataProvider: LegacyDataProvider) => (
      ...rest: Parameters<LegacyDataProvider>
    ) => {
      const [type, resource, params] = rest;
      return dataProvider(type, getGqlResource(resource), params);
    }
  );

function App() {
  const [dataProvider, setDataProvider] = useState<DataProvider>();
  useEffect(() => {
    let restoreFetch;

    const fetchDataProvider = async () => {
      const dataProviderInstance = await myDataProvider();
      setDataProvider(
        // GOTCHA: dataProviderInstance can be a function
        () => dataProviderInstance
      );
    };

    fetchDataProvider();

    return restoreFetch;
  }, []);

  if (!dataProvider) {
    return (
      <div className="loader-container">
        <div className="loader">Loading...</div>
      </div>
    );
  }
  return (
    <ApolloProvider client={APOLLO_CLIENT}>
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        loginPage={Login}
        customRoutes={customRoutes}
      >
        {/* <Resource name="users" {...Users} /> */}
        <Resource name="users" {...Users} />
      </Admin>
    </ApolloProvider>
  );
}

export default App;
