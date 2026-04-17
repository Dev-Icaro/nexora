export const typeDefs = `#graphql
  type Post {
    id: ID!
    body: String!
    createdAt: String!
    username: String!
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
  }

  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    body: String!
  }

  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    createdAt: String!
  }

  input RegisterRequest {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  input LoginRequest {
    email: String!
    password: String!
  }

  type LoginResponse {
    code: Int!
    message: String!
    success: Boolean!
    accessToken: String
    user: User
  }

  type RefreshResponse {
    code: Int!
    message: String!
    success: Boolean!
    accessToken: String
  }

  type LogoutResponse {
    code: Int!
    message: String!
    success: Boolean!
  }

  type Query {
    getPosts: [Post]
    getPost(postId: ID!): Post
  }

  type RegisterResponse {
    code: Int!
    message: String!
    success: Boolean!
    user: User
  }

  type Mutation {
    register(registerRequest: RegisterRequest): RegisterResponse!
    login(loginRequest: LoginRequest!): LoginResponse!
    refresh: RefreshResponse!
    logout: LogoutResponse!

    createPost(body: String!): Post!
    deletePost(postId: ID!): String!

    createComment(postId: String!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!

    likePost(postId: ID!): Post!
  }

  type Subscription {
    newPost: Post!
  }
`;
