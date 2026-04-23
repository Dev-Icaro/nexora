export const typeDefs = `#graphql
  type Post {
    id: ID!
    body: String!
    mediaUrl: String
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
    user: User
  }

  type LogoutResponse {
    code: Int!
    message: String!
    success: Boolean!
  }

  type PostEdge {
    node: Post!
    cursor: String!
  }

  type PageInfo {
    startCursor: String
    endCursor: String
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
  }

  type Query {
    getPosts: [Post]
    getPost(postId: ID!): Post
    feed(first: Int, after: String): PostConnection!
  }

  type RegisterResponse {
    code: Int!
    message: String!
    success: Boolean!
    user: User
  }

  type CreatePostResponse {
    code: Int!
    message: String!
    success: Boolean!
    post: Post
  }

  type DeletePostResponse {
    code: Int!
    message: String!
    success: Boolean!
  }

  type CreateCommentResponse {
    code: Int!
    message: String!
    success: Boolean!
    comment: Comment
  }

  type DeleteCommentResponse {
    code: Int!
    message: String!
    success: Boolean!
    comment: Comment
  }

  type LikePostResponse {
    code: Int!
    message: String!
    success: Boolean!
    post: Post
  }

  type Mutation {
    register(registerRequest: RegisterRequest): RegisterResponse!
    login(loginRequest: LoginRequest!): LoginResponse!
    refresh: RefreshResponse!
    logout: LogoutResponse!

    createPost(body: String!, mediaUrl: String): CreatePostResponse!
    deletePost(postId: ID!): DeletePostResponse!

    createComment(postId: String!, body: String!): CreateCommentResponse!
    deleteComment(postId: ID!, commentId: ID!): DeleteCommentResponse!

    likePost(postId: ID!): LikePostResponse!
  }

  type Subscription {
    newPost: Post!
  }
`;
