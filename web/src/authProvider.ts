import { AuthProvider } from "react-admin";
// import { useLoginMutation } from "./generated/graphql";
import { gql, useMutation } from "@apollo/client";

const authProvider: AuthProvider = {
  login: async ({ username, password, loginMutation }) => {
    const response = await loginMutation({
      variables: { usernameOrEmail: username, password },
      //   update: (cache, { data }) => {
      //     cache.writeQuery<MeQuery>({
      //       query: MeDocument,
      //       data: {
      //         __typename: "Query",
      //         me: data?.login.user,
      //       },
      //     });
      //     cache.evict({ fieldName: "posts:{}" });
      //   },
    });
    console.log(response);
    if (response.data?.login.errors) {
      //   localStorage.setItem("not_authenticated", "true");
      return Promise.reject(response.data?.login.errors[0]);
    } else if (response.data?.login.user) {
      // localStorage.removeItem("not_authenticated");
      //   localStorage.removeItem("role");
      //   localStorage.setItem(
      //     "avatar",
      //     "data:image/jpeg;base64,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"
      //   );
      localStorage.setItem("username", response.data?.login.user.name);
      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  },
  logout: () => {
    localStorage.removeItem("username");
    return Promise.resolve();
  },
  checkError: () =>
    localStorage.getItem("username") ? Promise.resolve() : Promise.reject(),
  checkAuth: () =>
    localStorage.getItem("username") ? Promise.resolve() : Promise.reject(),
  getPermissions: () => Promise.reject("Unknown method"),
  getIdentity: () =>
    Promise.resolve({
      id: "user",
      fullName: localStorage.getItem("username"),
      avatar:
        "data:image/jpeg;base64,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",
    }),
};

export default authProvider;
