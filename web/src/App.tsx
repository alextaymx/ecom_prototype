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
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import Users from "./pages/reviews";
import { setContext } from "@apollo/client/link/context";
const errorLink = onError(
  ({ operation, response, graphQLErrors, networkError }) => {
    console.log("resp", response);
    // response.data = null;
    // response.errors = null;
    if (graphQLErrors) {
      const responseError = response.errors.map((e) => {
        switch (e.message) {
          case "LOGIN_USER":
            return { ...e, status: 401 };
          default:
            return e;
        }
      });
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
      response.errors = responseError;
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
  }
);
const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("auth_token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? token : "",
    },
  };
});

const APOLLO_CLIENT = new ApolloClient({
  // uri: "http://localhost:4000/graphql",
  link: authLink.concat(httpLink),
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
      link: authLink.concat(httpLink),
      // uri: "http://localhost:4000/graphql",
      credentials: "include",
      cache: new InMemoryCache(),
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
    const fetchDataProvider = async () => {
      const dataProviderInstance = await myDataProvider();
      setDataProvider(
        // GOTCHA: dataProviderInstance can be a function
        () => dataProviderInstance
      );
    };

    fetchDataProvider();
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
