import { ApolloQueryResult } from "apollo-client";
import buildGraphQLProvider, {
  buildQuery as buildQueryFactory,
} from "ra-data-graphql-simple";
import { DELETE, LegacyDataProvider } from "react-admin";
import gql from "graphql-tag";
import {
  IntrospectionField,
  IntrospectionSchema,
  IntrospectionType,
} from "graphql";
import { client } from "./client";
import { ACTIONS } from "./actions";

const getGqlResource = (resource: string) => {
  switch (resource) {
    case "users":
      return "User";

    case "products":
      return "Product";

    default:
      throw new Error(`Unknown resource ${resource}`);
  }
};

type IntrospectionResource = IntrospectionType & {
  [key: string]: IntrospectionField;
};

interface IntrospectionResults {
  types: IntrospectionType[];
  queries: IntrospectionField[];
  resources: IntrospectionResource[];
  schema: IntrospectionSchema;
}

const customBuildQuery = (
  introspectionResults: IntrospectionResults
): LegacyDataProvider => {
  const buildQuery = buildQueryFactory(introspectionResults);
  // console.log(introspectionResults);
  return (type, resource, params) => {
    // console.log(type, resource, params, "alex");
    switch (type) {
      case ACTIONS.approveUser:
        return {
          query: gql`
            mutation approveUser($token: String, $email: String) {
              approveUser(token: $token, email: $email)
            }
          `,
          variables: params,
          parseResponse: ({ data }: ApolloQueryResult<any>) => {
            if (data["approveUser"]) {
              return { data: params };
            } else {
              return Promise.reject(new Error(`Could not approve ${resource}`));
            }
          },
        };
      case DELETE: {
        return {
          query: gql`mutation remove${resource}($id: ID!) {
                        remove${resource}(id: $id)
                    }`,
          variables: { id: params.id },
          parseResponse: ({ data }: ApolloQueryResult<any>) => {
            if (data[`remove${resource}`]) {
              return { data: { id: params.id } };
            }
            throw new Error(`Could not delete ${resource}`);
          },
        };
      }
      default:
        return buildQuery(type, resource, params);
    }
  };
};

const graphqlProvider = () => {
  return buildGraphQLProvider({
    client,
    introspection: {
      operationNames: {
        [DELETE]: (resource: IntrospectionType) => `remove${resource.name}`,
      },
    },
    buildQuery: customBuildQuery,
  }).then(
    (dataProvider: LegacyDataProvider) => (
      ...rest: Parameters<LegacyDataProvider>
    ) => {
      const [type, resource, params] = rest;
      return dataProvider(type, getGqlResource(resource), params);
    }
  );
};
export default graphqlProvider;
