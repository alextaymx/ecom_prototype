const dataProvider = (type: string) => {
  switch (type) {
    case "graphql":
      return import("./graphql").then((factory) => factory.default());
    default:
      return import("./graphql").then((provider) => provider.default);
  }
};
export default dataProvider;
