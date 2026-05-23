/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation Register($registerRequest: RegisterRequest!) {\n    register(registerRequest: $registerRequest) {\n      code\n      message\n      success\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  mutation Login($loginRequest: LoginRequest!) {\n    login(loginRequest: $loginRequest) {\n      code\n      message\n      success\n      accessToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Refresh {\n    refresh {\n      code\n      message\n      success\n      accessToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": typeof types.RefreshDocument,
    "\n  mutation Logout {\n    logout {\n      code\n      message\n      success\n    }\n  }\n": typeof types.LogoutDocument,
    "\n  mutation RequestPasswordReset($requestPasswordResetRequest: RequestPasswordResetRequest!) {\n    requestPasswordReset(requestPasswordResetRequest: $requestPasswordResetRequest) {\n      code\n      message\n      success\n    }\n  }\n": typeof types.RequestPasswordResetDocument,
    "\n  mutation ApplyPasswordReset($applyPasswordResetRequest: ApplyPasswordResetRequest!) {\n    applyPasswordReset(applyPasswordResetRequest: $applyPasswordResetRequest) {\n      code\n      message\n      success\n    }\n  }\n": typeof types.ApplyPasswordResetDocument,
    "\n  query ValidatePasswordResetToken($token: String!) {\n    validatePasswordResetToken(token: $token) {\n      code\n      message\n      success\n    }\n  }\n": typeof types.ValidatePasswordResetTokenDocument,
    "\n  mutation GetUploadUrl($request: GetUploadUrlRequest!) {\n    getUploadUrl(request: $request) {\n      code\n      message\n      success\n      uploadUrl\n      fields\n      objectKey\n    }\n  }\n": typeof types.GetUploadUrlDocument,
    "\n  mutation CreatePost($body: String!, $objectKey: String) {\n    createPost(body: $body, objectKey: $objectKey) {\n      code\n      message\n      success\n      post {\n        id\n        body\n        mediaUrl\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n        likeCount\n        commentCount\n      }\n    }\n  }\n": typeof types.CreatePostDocument,
    "\n  mutation LikePost($postId: ID!) {\n    likePost(postId: $postId) {\n      code\n      message\n      success\n    }\n  }\n": typeof types.LikePostDocument,
    "\n  mutation CreateComment($postId: String!, $body: String!) {\n    createComment(postId: $postId, body: $body) {\n      code\n      message\n      success\n      comment {\n        id\n        body\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n      }\n    }\n  }\n": typeof types.CreateCommentDocument,
    "\n  query GetPost($postId: ID!) {\n    getPost(postId: $postId) {\n      id\n      body\n      mediaUrl\n      createdAt\n      author {\n        id\n        username\n        avatarUrl\n      }\n      likeCount\n      commentCount\n      comments {\n        id\n        body\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n      }\n      likes {\n        id\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n": typeof types.GetPostDocument,
    "\n  query GetUserPosts($userId: ID!, $first: Int, $after: String) {\n    getUserPosts(userId: $userId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          body\n          mediaUrl\n          createdAt\n          author {\n            id\n            username\n            avatarUrl\n          }\n          likeCount\n          commentCount\n          likes {\n            id\n            author {\n              id\n              username\n            }\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n": typeof types.GetUserPostsDocument,
    "\n  subscription OnNewPost {\n    newPost {\n      id\n      body\n      mediaUrl\n      createdAt\n      author {\n        id\n        username\n        avatarUrl\n      }\n      likeCount\n      commentCount\n      likes {\n        id\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n": typeof types.OnNewPostDocument,
    "\n  query GetFeed($first: Int, $after: String) {\n    feed(first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          body\n          mediaUrl\n          createdAt\n          author {\n            id\n            username\n            avatarUrl\n          }\n          likeCount\n          commentCount\n          likes {\n            id\n            author {\n              id\n              username\n            }\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n": typeof types.GetFeedDocument,
    "\n  mutation UpdateProfile($updateProfileRequest: UpdateProfileRequest!) {\n    updateProfile(updateProfileRequest: $updateProfileRequest) {\n      code\n      message\n      success\n      user {\n        id\n        email\n        username\n        bio\n        position\n        avatarUrl\n      }\n    }\n  }\n": typeof types.UpdateProfileDocument,
    "\n  mutation GetAvatarUploadUrl($request: GetUploadUrlRequest!) {\n    getAvatarUploadUrl(request: $request) {\n      code\n      message\n      success\n      uploadUrl\n      fields\n      objectKey\n    }\n  }\n": typeof types.GetAvatarUploadUrlDocument,
    "\n  query GetProfile($userId: ID!) {\n    getUserById(userId: $userId) {\n      id\n      username\n      bio\n      position\n      avatarUrl\n      email\n      storageInfo {\n        usedBytes\n        quotaBytes\n        remainingBytes\n        usedPercent\n      }\n    }\n  }\n": typeof types.GetProfileDocument,
    "\n  mutation UpdateThemePreference($theme: ThemePreference!) {\n    updateThemePreference(theme: $theme) {\n      code\n      message\n      success\n      user {\n        id\n        themePreference\n      }\n    }\n  }\n": typeof types.UpdateThemePreferenceDocument,
};
const documents: Documents = {
    "\n  mutation Register($registerRequest: RegisterRequest!) {\n    register(registerRequest: $registerRequest) {\n      code\n      message\n      success\n    }\n  }\n": types.RegisterDocument,
    "\n  mutation Login($loginRequest: LoginRequest!) {\n    login(loginRequest: $loginRequest) {\n      code\n      message\n      success\n      accessToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Refresh {\n    refresh {\n      code\n      message\n      success\n      accessToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n": types.RefreshDocument,
    "\n  mutation Logout {\n    logout {\n      code\n      message\n      success\n    }\n  }\n": types.LogoutDocument,
    "\n  mutation RequestPasswordReset($requestPasswordResetRequest: RequestPasswordResetRequest!) {\n    requestPasswordReset(requestPasswordResetRequest: $requestPasswordResetRequest) {\n      code\n      message\n      success\n    }\n  }\n": types.RequestPasswordResetDocument,
    "\n  mutation ApplyPasswordReset($applyPasswordResetRequest: ApplyPasswordResetRequest!) {\n    applyPasswordReset(applyPasswordResetRequest: $applyPasswordResetRequest) {\n      code\n      message\n      success\n    }\n  }\n": types.ApplyPasswordResetDocument,
    "\n  query ValidatePasswordResetToken($token: String!) {\n    validatePasswordResetToken(token: $token) {\n      code\n      message\n      success\n    }\n  }\n": types.ValidatePasswordResetTokenDocument,
    "\n  mutation GetUploadUrl($request: GetUploadUrlRequest!) {\n    getUploadUrl(request: $request) {\n      code\n      message\n      success\n      uploadUrl\n      fields\n      objectKey\n    }\n  }\n": types.GetUploadUrlDocument,
    "\n  mutation CreatePost($body: String!, $objectKey: String) {\n    createPost(body: $body, objectKey: $objectKey) {\n      code\n      message\n      success\n      post {\n        id\n        body\n        mediaUrl\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n        likeCount\n        commentCount\n      }\n    }\n  }\n": types.CreatePostDocument,
    "\n  mutation LikePost($postId: ID!) {\n    likePost(postId: $postId) {\n      code\n      message\n      success\n    }\n  }\n": types.LikePostDocument,
    "\n  mutation CreateComment($postId: String!, $body: String!) {\n    createComment(postId: $postId, body: $body) {\n      code\n      message\n      success\n      comment {\n        id\n        body\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n      }\n    }\n  }\n": types.CreateCommentDocument,
    "\n  query GetPost($postId: ID!) {\n    getPost(postId: $postId) {\n      id\n      body\n      mediaUrl\n      createdAt\n      author {\n        id\n        username\n        avatarUrl\n      }\n      likeCount\n      commentCount\n      comments {\n        id\n        body\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n      }\n      likes {\n        id\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n": types.GetPostDocument,
    "\n  query GetUserPosts($userId: ID!, $first: Int, $after: String) {\n    getUserPosts(userId: $userId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          body\n          mediaUrl\n          createdAt\n          author {\n            id\n            username\n            avatarUrl\n          }\n          likeCount\n          commentCount\n          likes {\n            id\n            author {\n              id\n              username\n            }\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n": types.GetUserPostsDocument,
    "\n  subscription OnNewPost {\n    newPost {\n      id\n      body\n      mediaUrl\n      createdAt\n      author {\n        id\n        username\n        avatarUrl\n      }\n      likeCount\n      commentCount\n      likes {\n        id\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n": types.OnNewPostDocument,
    "\n  query GetFeed($first: Int, $after: String) {\n    feed(first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          body\n          mediaUrl\n          createdAt\n          author {\n            id\n            username\n            avatarUrl\n          }\n          likeCount\n          commentCount\n          likes {\n            id\n            author {\n              id\n              username\n            }\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n": types.GetFeedDocument,
    "\n  mutation UpdateProfile($updateProfileRequest: UpdateProfileRequest!) {\n    updateProfile(updateProfileRequest: $updateProfileRequest) {\n      code\n      message\n      success\n      user {\n        id\n        email\n        username\n        bio\n        position\n        avatarUrl\n      }\n    }\n  }\n": types.UpdateProfileDocument,
    "\n  mutation GetAvatarUploadUrl($request: GetUploadUrlRequest!) {\n    getAvatarUploadUrl(request: $request) {\n      code\n      message\n      success\n      uploadUrl\n      fields\n      objectKey\n    }\n  }\n": types.GetAvatarUploadUrlDocument,
    "\n  query GetProfile($userId: ID!) {\n    getUserById(userId: $userId) {\n      id\n      username\n      bio\n      position\n      avatarUrl\n      email\n      storageInfo {\n        usedBytes\n        quotaBytes\n        remainingBytes\n        usedPercent\n      }\n    }\n  }\n": types.GetProfileDocument,
    "\n  mutation UpdateThemePreference($theme: ThemePreference!) {\n    updateThemePreference(theme: $theme) {\n      code\n      message\n      success\n      user {\n        id\n        themePreference\n      }\n    }\n  }\n": types.UpdateThemePreferenceDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($registerRequest: RegisterRequest!) {\n    register(registerRequest: $registerRequest) {\n      code\n      message\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation Register($registerRequest: RegisterRequest!) {\n    register(registerRequest: $registerRequest) {\n      code\n      message\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($loginRequest: LoginRequest!) {\n    login(loginRequest: $loginRequest) {\n      code\n      message\n      success\n      accessToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($loginRequest: LoginRequest!) {\n    login(loginRequest: $loginRequest) {\n      code\n      message\n      success\n      accessToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Refresh {\n    refresh {\n      code\n      message\n      success\n      accessToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Refresh {\n    refresh {\n      code\n      message\n      success\n      accessToken\n      user {\n        id\n        email\n        username\n        avatarUrl\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout {\n      code\n      message\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout {\n      code\n      message\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RequestPasswordReset($requestPasswordResetRequest: RequestPasswordResetRequest!) {\n    requestPasswordReset(requestPasswordResetRequest: $requestPasswordResetRequest) {\n      code\n      message\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation RequestPasswordReset($requestPasswordResetRequest: RequestPasswordResetRequest!) {\n    requestPasswordReset(requestPasswordResetRequest: $requestPasswordResetRequest) {\n      code\n      message\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ApplyPasswordReset($applyPasswordResetRequest: ApplyPasswordResetRequest!) {\n    applyPasswordReset(applyPasswordResetRequest: $applyPasswordResetRequest) {\n      code\n      message\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation ApplyPasswordReset($applyPasswordResetRequest: ApplyPasswordResetRequest!) {\n    applyPasswordReset(applyPasswordResetRequest: $applyPasswordResetRequest) {\n      code\n      message\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ValidatePasswordResetToken($token: String!) {\n    validatePasswordResetToken(token: $token) {\n      code\n      message\n      success\n    }\n  }\n"): (typeof documents)["\n  query ValidatePasswordResetToken($token: String!) {\n    validatePasswordResetToken(token: $token) {\n      code\n      message\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation GetUploadUrl($request: GetUploadUrlRequest!) {\n    getUploadUrl(request: $request) {\n      code\n      message\n      success\n      uploadUrl\n      fields\n      objectKey\n    }\n  }\n"): (typeof documents)["\n  mutation GetUploadUrl($request: GetUploadUrlRequest!) {\n    getUploadUrl(request: $request) {\n      code\n      message\n      success\n      uploadUrl\n      fields\n      objectKey\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePost($body: String!, $objectKey: String) {\n    createPost(body: $body, objectKey: $objectKey) {\n      code\n      message\n      success\n      post {\n        id\n        body\n        mediaUrl\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n        likeCount\n        commentCount\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePost($body: String!, $objectKey: String) {\n    createPost(body: $body, objectKey: $objectKey) {\n      code\n      message\n      success\n      post {\n        id\n        body\n        mediaUrl\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n        likeCount\n        commentCount\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LikePost($postId: ID!) {\n    likePost(postId: $postId) {\n      code\n      message\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation LikePost($postId: ID!) {\n    likePost(postId: $postId) {\n      code\n      message\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateComment($postId: String!, $body: String!) {\n    createComment(postId: $postId, body: $body) {\n      code\n      message\n      success\n      comment {\n        id\n        body\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateComment($postId: String!, $body: String!) {\n    createComment(postId: $postId, body: $body) {\n      code\n      message\n      success\n      comment {\n        id\n        body\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPost($postId: ID!) {\n    getPost(postId: $postId) {\n      id\n      body\n      mediaUrl\n      createdAt\n      author {\n        id\n        username\n        avatarUrl\n      }\n      likeCount\n      commentCount\n      comments {\n        id\n        body\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n      }\n      likes {\n        id\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetPost($postId: ID!) {\n    getPost(postId: $postId) {\n      id\n      body\n      mediaUrl\n      createdAt\n      author {\n        id\n        username\n        avatarUrl\n      }\n      likeCount\n      commentCount\n      comments {\n        id\n        body\n        createdAt\n        author {\n          id\n          username\n          avatarUrl\n        }\n      }\n      likes {\n        id\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetUserPosts($userId: ID!, $first: Int, $after: String) {\n    getUserPosts(userId: $userId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          body\n          mediaUrl\n          createdAt\n          author {\n            id\n            username\n            avatarUrl\n          }\n          likeCount\n          commentCount\n          likes {\n            id\n            author {\n              id\n              username\n            }\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetUserPosts($userId: ID!, $first: Int, $after: String) {\n    getUserPosts(userId: $userId, first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          body\n          mediaUrl\n          createdAt\n          author {\n            id\n            username\n            avatarUrl\n          }\n          likeCount\n          commentCount\n          likes {\n            id\n            author {\n              id\n              username\n            }\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription OnNewPost {\n    newPost {\n      id\n      body\n      mediaUrl\n      createdAt\n      author {\n        id\n        username\n        avatarUrl\n      }\n      likeCount\n      commentCount\n      likes {\n        id\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription OnNewPost {\n    newPost {\n      id\n      body\n      mediaUrl\n      createdAt\n      author {\n        id\n        username\n        avatarUrl\n      }\n      likeCount\n      commentCount\n      likes {\n        id\n        author {\n          id\n          username\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetFeed($first: Int, $after: String) {\n    feed(first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          body\n          mediaUrl\n          createdAt\n          author {\n            id\n            username\n            avatarUrl\n          }\n          likeCount\n          commentCount\n          likes {\n            id\n            author {\n              id\n              username\n            }\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetFeed($first: Int, $after: String) {\n    feed(first: $first, after: $after) {\n      edges {\n        cursor\n        node {\n          id\n          body\n          mediaUrl\n          createdAt\n          author {\n            id\n            username\n            avatarUrl\n          }\n          likeCount\n          commentCount\n          likes {\n            id\n            author {\n              id\n              username\n            }\n          }\n        }\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateProfile($updateProfileRequest: UpdateProfileRequest!) {\n    updateProfile(updateProfileRequest: $updateProfileRequest) {\n      code\n      message\n      success\n      user {\n        id\n        email\n        username\n        bio\n        position\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProfile($updateProfileRequest: UpdateProfileRequest!) {\n    updateProfile(updateProfileRequest: $updateProfileRequest) {\n      code\n      message\n      success\n      user {\n        id\n        email\n        username\n        bio\n        position\n        avatarUrl\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation GetAvatarUploadUrl($request: GetUploadUrlRequest!) {\n    getAvatarUploadUrl(request: $request) {\n      code\n      message\n      success\n      uploadUrl\n      fields\n      objectKey\n    }\n  }\n"): (typeof documents)["\n  mutation GetAvatarUploadUrl($request: GetUploadUrlRequest!) {\n    getAvatarUploadUrl(request: $request) {\n      code\n      message\n      success\n      uploadUrl\n      fields\n      objectKey\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetProfile($userId: ID!) {\n    getUserById(userId: $userId) {\n      id\n      username\n      bio\n      position\n      avatarUrl\n      email\n      storageInfo {\n        usedBytes\n        quotaBytes\n        remainingBytes\n        usedPercent\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetProfile($userId: ID!) {\n    getUserById(userId: $userId) {\n      id\n      username\n      bio\n      position\n      avatarUrl\n      email\n      storageInfo {\n        usedBytes\n        quotaBytes\n        remainingBytes\n        usedPercent\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateThemePreference($theme: ThemePreference!) {\n    updateThemePreference(theme: $theme) {\n      code\n      message\n      success\n      user {\n        id\n        themePreference\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateThemePreference($theme: ThemePreference!) {\n    updateThemePreference(theme: $theme) {\n      code\n      message\n      success\n      user {\n        id\n        themePreference\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;