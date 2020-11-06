import React, { useEffect, useState } from "react";
import "./App.css";
import { Admin, DataProvider, Resource } from "react-admin";
import authProvider from "./authProvider";
import graphqlProvider from "./dataProvider/graphql";
import { ApolloProvider } from "@apollo/client";
import { client } from "./dataProvider/client";

import customRoutes from "./routes";
import Login from "./pages/Login";
import Users from "./pages/users";

function App() {
  const [dataProvider, setDataProvider] = useState<DataProvider>();
  useEffect(() => {
    const fetchDataProvider = async () => {
      const dataProviderInstance = await graphqlProvider();
      setDataProvider(() => dataProviderInstance);
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
    <ApolloProvider client={client}>
      <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        loginPage={Login}
        customRoutes={customRoutes}
      >
        <Resource name="users" {...Users} />
      </Admin>
    </ApolloProvider>
  );
}

export default App;
