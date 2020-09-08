import gql from "graphql-tag";

export const FETCH_POSTS_QUERY = gql`
  {
    getPosts {
      id
      body
      createdAt
      username
      likeCount
      likes {
        username
      }
      commentCount
      comments {
        id
        username
        createdAt
        body
      }
    }
  }
`;

export const CREATE_POST_MUTATION = gql`
  mutation createPost($body: String!) {
    createPost(body: $body) {
      id
      body
      createdAt
      username
      likes {
        id
        username
        createdAt
      }
      likeCount
      comments {
        id
        body
        username
        createdAt
      }
      commentCount
    }
  }
`;

export const UPLOAD_SINGLE_PHOTO = gql`
  mutation singlePhotoUpload(
    $url: String!
    $public: Boolean!
    $description: String!
    $tags: [String]!
  ) {
    singlePhotoUpload(
      photoInput: {
        url: $url
        public: $public
        description: $description
        tags: $tags
      }
    )
  }
`;

export const UPLOAD_MULTIPLE_PHOTO = gql`
  mutation multiplePhotoUpload($photoInput: [PhotoInput]!) {
    multiplePhotoUpload(photoInputs: $photoInput)
  }
`;

export const GET_PUBLIC_PICTURE_QUERY = gql`
  query {
    getPublicPictures {
      src
      description
      tags
      id
    }
  }
`;

export const GET_PICTURE_QUERY = gql`
  query($username: String!) {
    getPicture(username: $username)
  }
`;
