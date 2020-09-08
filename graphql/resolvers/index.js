const userResolvers = require("./users");
const photoResolvers = require("./photo");

module.exports = {
  Query: {
    ...photoResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...photoResolvers.Mutation,
  },
};
