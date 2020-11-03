import React from "react";
import "./App.css";
import { Admin, Resource } from "react-admin";
// import buildGraphQLProvider from "ra-data-graphql-simple";
// import { createNetworkInterface } from "react-apollo";
// import buildApolloClient, {
//   buildQuery as buildQueryFactory,
// } from "ra-data-graphql-simple";
import buildGraphQLProvider from "ra-data-graphql-simple";
import authProvider from "./authProvider";
import Login from "./pages/Login";
import customRoutes from "./routes";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
// import buildQuery from './buildQuery'; // see Specify your queries and mutations section below

const APOLLO_CLIENT = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={APOLLO_CLIENT}>
      <Admin
        dataProvider={buildGraphQLProvider({
          clientOptions: { uri: "http://localhost:4000/graphql" },
        })}
        authProvider={authProvider}
        loginPage={Login}
        customRoutes={customRoutes}
      >
        <Resource name="posts" />
      </Admin>
    </ApolloProvider>
  );
}

export default App;
