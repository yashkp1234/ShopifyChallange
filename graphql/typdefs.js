const gql = require("graphql-tag");

module.exports = gql`
  type Photo {
    id: ID!
    src: String!
    createdAt: String!
    public: Boolean!
    owner: String
    public_id: String!
    description: String!
    tags: [String]!
  }
  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    createdAt: String!
  }

  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  input PhotoInput {
    url: String!
    public: Boolean!
    description: String!
    tags: [String]!
  }

  type Query {
    getPublicPictures: [Photo]!
    getUserPictures: [Photo]!
  }

  type Mutation {
    register(registerInput: RegisterInput!): User!
    login(username: String!, password: String!): User!
    singlePhotoUpload(photoInput: PhotoInput!): Boolean!
    multiplePhotoUpload(photoInputs: [PhotoInput]!): Boolean!
    singlePhotoDelete(id: String!): Boolean!
    multiPhotoDelete(ids: [String]!): Boolean!
    allPhotoDelete: Boolean!
  }
`;
