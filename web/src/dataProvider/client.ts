import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
const source = "http://localhost:4000/graphql";

const httpLink = createHttpLink({
  uri: source,
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
export let client = new ApolloClient({
  link: authLink.concat(httpLink),
  credentials: "include",
  cache: new InMemoryCache(),
});

// import { onError } from "@apollo/client/link/error";
// const errorLink = onError(
//   ({ operation, response, graphQLErrors, networkError }) => {
//     console.log("resp", response);
//     // response.data = null;
//     // response.errors = null;
//     if (graphQLErrors) {
//       const responseError = response.errors.map((e) => {
//         switch (e.message) {
//           case "LOGIN_USER":
//             return { ...e, status: 401 };
//           default:
//             return e;
//         }
//       });
//       graphQLErrors.map(({ message, locations, path }) =>
//         console.log(
//           `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
//         )
//       );
//       response.errors = responseError;
//     }
//     if (networkError) console.log(`[Network error]: ${networkError}`);
//   }
// );
