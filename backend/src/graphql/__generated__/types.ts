import { GraphQLResolveInfo } from 'graphql';

import { CommentDto } from '../../dtos/comment/comment.dto';
import { LikeDto } from '../../dtos/post/like.dto';
import { PostDto } from '../../dtos/post/post.dto';
import { UserDto } from '../../dtos/user/user.dto';
import { GraphQLContext } from '../context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type ApplyPasswordResetRequest = {
  confirmPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type ApplyPasswordResetResponse = {
  __typename?: 'ApplyPasswordResetResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Comment = {
  __typename?: 'Comment';
  author: User;
  body: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type CreateCommentResponse = {
  __typename?: 'CreateCommentResponse';
  code: Scalars['Int']['output'];
  comment?: Maybe<Comment>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CreatePostResponse = {
  __typename?: 'CreatePostResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  post?: Maybe<Post>;
  success: Scalars['Boolean']['output'];
};

export type DeleteCommentResponse = {
  __typename?: 'DeleteCommentResponse';
  code: Scalars['Int']['output'];
  comment?: Maybe<Comment>;
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeletePostResponse = {
  __typename?: 'DeletePostResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type GetUploadUrlRequest = {
  contentType: Scalars['String']['input'];
  fileSizeBytes: Scalars['Int']['input'];
  filename: Scalars['String']['input'];
};

export type GetUploadUrlResponse = {
  __typename?: 'GetUploadUrlResponse';
  code: Scalars['Int']['output'];
  fields?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  objectKey?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  uploadUrl?: Maybe<Scalars['String']['output']>;
};

export type Like = {
  __typename?: 'Like';
  author: User;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type LikePostResponse = {
  __typename?: 'LikePostResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  post?: Maybe<Post>;
  success: Scalars['Boolean']['output'];
};

export type LoginRequest = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  accessToken?: Maybe<Scalars['String']['output']>;
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type LogoutResponse = {
  __typename?: 'LogoutResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  applyPasswordReset: ApplyPasswordResetResponse;
  createComment: CreateCommentResponse;
  createPost: CreatePostResponse;
  deleteComment: DeleteCommentResponse;
  deletePost: DeletePostResponse;
  getAvatarUploadUrl: GetUploadUrlResponse;
  getUploadUrl: GetUploadUrlResponse;
  likePost: LikePostResponse;
  login: LoginResponse;
  logout: LogoutResponse;
  refresh: RefreshResponse;
  register: RegisterResponse;
  requestPasswordReset: RequestPasswordResetResponse;
  updateProfile: UpdateProfileResponse;
  updateThemePreference: UpdateThemePreferenceResponse;
};

export type MutationApplyPasswordResetArgs = {
  applyPasswordResetRequest: ApplyPasswordResetRequest;
};

export type MutationCreateCommentArgs = {
  body: Scalars['String']['input'];
  postId: Scalars['String']['input'];
};

export type MutationCreatePostArgs = {
  body: Scalars['String']['input'];
  objectKey?: InputMaybe<Scalars['String']['input']>;
};

export type MutationDeleteCommentArgs = {
  commentId: Scalars['ID']['input'];
  postId: Scalars['ID']['input'];
};

export type MutationDeletePostArgs = {
  postId: Scalars['ID']['input'];
};

export type MutationGetAvatarUploadUrlArgs = {
  request: GetUploadUrlRequest;
};

export type MutationGetUploadUrlArgs = {
  request: GetUploadUrlRequest;
};

export type MutationLikePostArgs = {
  postId: Scalars['ID']['input'];
};

export type MutationLoginArgs = {
  loginRequest: LoginRequest;
};

export type MutationRegisterArgs = {
  registerRequest: RegisterRequest;
};

export type MutationRequestPasswordResetArgs = {
  requestPasswordResetRequest: RequestPasswordResetRequest;
};

export type MutationUpdateProfileArgs = {
  updateProfileRequest: UpdateProfileRequest;
};

export type MutationUpdateThemePreferenceArgs = {
  theme: ThemePreference;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Post = {
  __typename?: 'Post';
  author: User;
  body: Scalars['String']['output'];
  commentCount: Scalars['Int']['output'];
  comments: Array<Maybe<Comment>>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  likeCount: Scalars['Int']['output'];
  likes: Array<Maybe<Like>>;
  mediaUrl?: Maybe<Scalars['String']['output']>;
};

export type PostConnection = {
  __typename?: 'PostConnection';
  edges: Array<PostEdge>;
  pageInfo: PageInfo;
};

export type PostEdge = {
  __typename?: 'PostEdge';
  cursor: Scalars['String']['output'];
  node: Post;
};

export type Query = {
  __typename?: 'Query';
  feed: PostConnection;
  getPost?: Maybe<Post>;
  getPosts?: Maybe<Array<Maybe<Post>>>;
  getUserById?: Maybe<User>;
  getUserPosts: PostConnection;
  validatePasswordResetToken: ValidatePasswordResetTokenResponse;
};

export type QueryFeedArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryGetPostArgs = {
  postId: Scalars['ID']['input'];
};

export type QueryGetUserByIdArgs = {
  userId: Scalars['ID']['input'];
};

export type QueryGetUserPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['ID']['input'];
};

export type QueryValidatePasswordResetTokenArgs = {
  token: Scalars['String']['input'];
};

export type RefreshResponse = {
  __typename?: 'RefreshResponse';
  accessToken?: Maybe<Scalars['String']['output']>;
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type RegisterRequest = {
  confirmPassword: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type RegisterResponse = {
  __typename?: 'RegisterResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type RequestPasswordResetRequest = {
  email: Scalars['String']['input'];
};

export type RequestPasswordResetResponse = {
  __typename?: 'RequestPasswordResetResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type StorageInfo = {
  __typename?: 'StorageInfo';
  quotaBytes: Scalars['Int']['output'];
  remainingBytes: Scalars['Int']['output'];
  usedBytes: Scalars['Int']['output'];
  usedPercent: Scalars['Float']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  newPost: Post;
};

export type ThemePreference = 'dark' | 'light' | 'system';

export type UpdateProfileRequest = {
  bio?: InputMaybe<Scalars['String']['input']>;
  objectKey?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfileResponse = {
  __typename?: 'UpdateProfileResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type UpdateThemePreferenceResponse = {
  __typename?: 'UpdateThemePreferenceResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
  user?: Maybe<User>;
};

export type User = {
  __typename?: 'User';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  position?: Maybe<Scalars['String']['output']>;
  storageInfo: StorageInfo;
  themePreference?: Maybe<ThemePreference>;
  username: Scalars['String']['output'];
};

export type ValidatePasswordResetTokenResponse = {
  __typename?: 'ValidatePasswordResetTokenResponse';
  code: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<
  TResult,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = Record<PropertyKey, never>,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ApplyPasswordResetRequest: ApplyPasswordResetRequest;
  ApplyPasswordResetResponse: ResolverTypeWrapper<ApplyPasswordResetResponse>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Comment: ResolverTypeWrapper<CommentDto>;
  CreateCommentResponse: ResolverTypeWrapper<
    Omit<CreateCommentResponse, 'comment'> & { comment?: Maybe<ResolversTypes['Comment']> }
  >;
  CreatePostResponse: ResolverTypeWrapper<Omit<CreatePostResponse, 'post'> & { post?: Maybe<ResolversTypes['Post']> }>;
  DeleteCommentResponse: ResolverTypeWrapper<
    Omit<DeleteCommentResponse, 'comment'> & { comment?: Maybe<ResolversTypes['Comment']> }
  >;
  DeletePostResponse: ResolverTypeWrapper<DeletePostResponse>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GetUploadUrlRequest: GetUploadUrlRequest;
  GetUploadUrlResponse: ResolverTypeWrapper<GetUploadUrlResponse>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Like: ResolverTypeWrapper<LikeDto>;
  LikePostResponse: ResolverTypeWrapper<Omit<LikePostResponse, 'post'> & { post?: Maybe<ResolversTypes['Post']> }>;
  LoginRequest: LoginRequest;
  LoginResponse: ResolverTypeWrapper<Omit<LoginResponse, 'user'> & { user?: Maybe<ResolversTypes['User']> }>;
  LogoutResponse: ResolverTypeWrapper<LogoutResponse>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Post: ResolverTypeWrapper<PostDto>;
  PostConnection: ResolverTypeWrapper<Omit<PostConnection, 'edges'> & { edges: Array<ResolversTypes['PostEdge']> }>;
  PostEdge: ResolverTypeWrapper<Omit<PostEdge, 'node'> & { node: ResolversTypes['Post'] }>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RefreshResponse: ResolverTypeWrapper<Omit<RefreshResponse, 'user'> & { user?: Maybe<ResolversTypes['User']> }>;
  RegisterRequest: RegisterRequest;
  RegisterResponse: ResolverTypeWrapper<Omit<RegisterResponse, 'user'> & { user?: Maybe<ResolversTypes['User']> }>;
  RequestPasswordResetRequest: RequestPasswordResetRequest;
  RequestPasswordResetResponse: ResolverTypeWrapper<RequestPasswordResetResponse>;
  StorageInfo: ResolverTypeWrapper<StorageInfo>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
  ThemePreference: ThemePreference;
  UpdateProfileRequest: UpdateProfileRequest;
  UpdateProfileResponse: ResolverTypeWrapper<
    Omit<UpdateProfileResponse, 'user'> & { user?: Maybe<ResolversTypes['User']> }
  >;
  UpdateThemePreferenceResponse: ResolverTypeWrapper<
    Omit<UpdateThemePreferenceResponse, 'user'> & { user?: Maybe<ResolversTypes['User']> }
  >;
  User: ResolverTypeWrapper<UserDto>;
  ValidatePasswordResetTokenResponse: ResolverTypeWrapper<ValidatePasswordResetTokenResponse>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ApplyPasswordResetRequest: ApplyPasswordResetRequest;
  ApplyPasswordResetResponse: ApplyPasswordResetResponse;
  Boolean: Scalars['Boolean']['output'];
  Comment: CommentDto;
  CreateCommentResponse: Omit<CreateCommentResponse, 'comment'> & { comment?: Maybe<ResolversParentTypes['Comment']> };
  CreatePostResponse: Omit<CreatePostResponse, 'post'> & { post?: Maybe<ResolversParentTypes['Post']> };
  DeleteCommentResponse: Omit<DeleteCommentResponse, 'comment'> & { comment?: Maybe<ResolversParentTypes['Comment']> };
  DeletePostResponse: DeletePostResponse;
  Float: Scalars['Float']['output'];
  GetUploadUrlRequest: GetUploadUrlRequest;
  GetUploadUrlResponse: GetUploadUrlResponse;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Like: LikeDto;
  LikePostResponse: Omit<LikePostResponse, 'post'> & { post?: Maybe<ResolversParentTypes['Post']> };
  LoginRequest: LoginRequest;
  LoginResponse: Omit<LoginResponse, 'user'> & { user?: Maybe<ResolversParentTypes['User']> };
  LogoutResponse: LogoutResponse;
  Mutation: Record<PropertyKey, never>;
  PageInfo: PageInfo;
  Post: PostDto;
  PostConnection: Omit<PostConnection, 'edges'> & { edges: Array<ResolversParentTypes['PostEdge']> };
  PostEdge: Omit<PostEdge, 'node'> & { node: ResolversParentTypes['Post'] };
  Query: Record<PropertyKey, never>;
  RefreshResponse: Omit<RefreshResponse, 'user'> & { user?: Maybe<ResolversParentTypes['User']> };
  RegisterRequest: RegisterRequest;
  RegisterResponse: Omit<RegisterResponse, 'user'> & { user?: Maybe<ResolversParentTypes['User']> };
  RequestPasswordResetRequest: RequestPasswordResetRequest;
  RequestPasswordResetResponse: RequestPasswordResetResponse;
  StorageInfo: StorageInfo;
  String: Scalars['String']['output'];
  Subscription: Record<PropertyKey, never>;
  UpdateProfileRequest: UpdateProfileRequest;
  UpdateProfileResponse: Omit<UpdateProfileResponse, 'user'> & { user?: Maybe<ResolversParentTypes['User']> };
  UpdateThemePreferenceResponse: Omit<UpdateThemePreferenceResponse, 'user'> & {
    user?: Maybe<ResolversParentTypes['User']>;
  };
  User: UserDto;
  ValidatePasswordResetTokenResponse: ValidatePasswordResetTokenResponse;
};

export type ApplyPasswordResetResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['ApplyPasswordResetResponse'] =
    ResolversParentTypes['ApplyPasswordResetResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type CommentResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment'],
> = {
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type CreateCommentResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['CreateCommentResponse'] = ResolversParentTypes['CreateCommentResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type CreatePostResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['CreatePostResponse'] = ResolversParentTypes['CreatePostResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  post?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type DeleteCommentResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['DeleteCommentResponse'] = ResolversParentTypes['DeleteCommentResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type DeletePostResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['DeletePostResponse'] = ResolversParentTypes['DeletePostResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type GetUploadUrlResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['GetUploadUrlResponse'] = ResolversParentTypes['GetUploadUrlResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  fields?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  uploadUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type LikeResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['Like'] = ResolversParentTypes['Like'],
> = {
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type LikePostResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['LikePostResponse'] = ResolversParentTypes['LikePostResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  post?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type LoginResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['LoginResponse'] = ResolversParentTypes['LoginResponse'],
> = {
  accessToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export type LogoutResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['LogoutResponse'] = ResolversParentTypes['LogoutResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation'],
> = {
  applyPasswordReset?: Resolver<
    ResolversTypes['ApplyPasswordResetResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationApplyPasswordResetArgs, 'applyPasswordResetRequest'>
  >;
  createComment?: Resolver<
    ResolversTypes['CreateCommentResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateCommentArgs, 'body' | 'postId'>
  >;
  createPost?: Resolver<
    ResolversTypes['CreatePostResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationCreatePostArgs, 'body'>
  >;
  deleteComment?: Resolver<
    ResolversTypes['DeleteCommentResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteCommentArgs, 'commentId' | 'postId'>
  >;
  deletePost?: Resolver<
    ResolversTypes['DeletePostResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationDeletePostArgs, 'postId'>
  >;
  getAvatarUploadUrl?: Resolver<
    ResolversTypes['GetUploadUrlResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationGetAvatarUploadUrlArgs, 'request'>
  >;
  getUploadUrl?: Resolver<
    ResolversTypes['GetUploadUrlResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationGetUploadUrlArgs, 'request'>
  >;
  likePost?: Resolver<
    ResolversTypes['LikePostResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationLikePostArgs, 'postId'>
  >;
  login?: Resolver<
    ResolversTypes['LoginResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationLoginArgs, 'loginRequest'>
  >;
  logout?: Resolver<ResolversTypes['LogoutResponse'], ParentType, ContextType>;
  refresh?: Resolver<ResolversTypes['RefreshResponse'], ParentType, ContextType>;
  register?: Resolver<
    ResolversTypes['RegisterResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationRegisterArgs, 'registerRequest'>
  >;
  requestPasswordReset?: Resolver<
    ResolversTypes['RequestPasswordResetResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationRequestPasswordResetArgs, 'requestPasswordResetRequest'>
  >;
  updateProfile?: Resolver<
    ResolversTypes['UpdateProfileResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateProfileArgs, 'updateProfileRequest'>
  >;
  updateThemePreference?: Resolver<
    ResolversTypes['UpdateThemePreferenceResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateThemePreferenceArgs, 'theme'>
  >;
};

export type PageInfoResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo'],
> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type PostResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['Post'] = ResolversParentTypes['Post'],
> = {
  author?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  commentCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  comments?: Resolver<Array<Maybe<ResolversTypes['Comment']>>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  likeCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  likes?: Resolver<Array<Maybe<ResolversTypes['Like']>>, ParentType, ContextType>;
  mediaUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type PostConnectionResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['PostConnection'] = ResolversParentTypes['PostConnection'],
> = {
  edges?: Resolver<Array<ResolversTypes['PostEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
};

export type PostEdgeResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['PostEdge'] = ResolversParentTypes['PostEdge'],
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = {
  feed?: Resolver<ResolversTypes['PostConnection'], ParentType, ContextType, Partial<QueryFeedArgs>>;
  getPost?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType, RequireFields<QueryGetPostArgs, 'postId'>>;
  getPosts?: Resolver<Maybe<Array<Maybe<ResolversTypes['Post']>>>, ParentType, ContextType>;
  getUserById?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<QueryGetUserByIdArgs, 'userId'>
  >;
  getUserPosts?: Resolver<
    ResolversTypes['PostConnection'],
    ParentType,
    ContextType,
    RequireFields<QueryGetUserPostsArgs, 'userId'>
  >;
  validatePasswordResetToken?: Resolver<
    ResolversTypes['ValidatePasswordResetTokenResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryValidatePasswordResetTokenArgs, 'token'>
  >;
};

export type RefreshResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['RefreshResponse'] = ResolversParentTypes['RefreshResponse'],
> = {
  accessToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export type RegisterResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['RegisterResponse'] = ResolversParentTypes['RegisterResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export type RequestPasswordResetResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['RequestPasswordResetResponse'] =
    ResolversParentTypes['RequestPasswordResetResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type StorageInfoResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['StorageInfo'] = ResolversParentTypes['StorageInfo'],
> = {
  quotaBytes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  remainingBytes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  usedBytes?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  usedPercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
};

export type SubscriptionResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription'],
> = {
  newPost?: SubscriptionResolver<ResolversTypes['Post'], 'newPost', ParentType, ContextType>;
};

export type UpdateProfileResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['UpdateProfileResponse'] = ResolversParentTypes['UpdateProfileResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export type UpdateThemePreferenceResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['UpdateThemePreferenceResponse'] =
    ResolversParentTypes['UpdateThemePreferenceResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
};

export type UserResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'],
> = {
  avatarUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  storageInfo?: Resolver<ResolversTypes['StorageInfo'], ParentType, ContextType>;
  themePreference?: Resolver<Maybe<ResolversTypes['ThemePreference']>, ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type ValidatePasswordResetTokenResponseResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes['ValidatePasswordResetTokenResponse'] =
    ResolversParentTypes['ValidatePasswordResetTokenResponse'],
> = {
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  ApplyPasswordResetResponse?: ApplyPasswordResetResponseResolvers<ContextType>;
  Comment?: CommentResolvers<ContextType>;
  CreateCommentResponse?: CreateCommentResponseResolvers<ContextType>;
  CreatePostResponse?: CreatePostResponseResolvers<ContextType>;
  DeleteCommentResponse?: DeleteCommentResponseResolvers<ContextType>;
  DeletePostResponse?: DeletePostResponseResolvers<ContextType>;
  GetUploadUrlResponse?: GetUploadUrlResponseResolvers<ContextType>;
  Like?: LikeResolvers<ContextType>;
  LikePostResponse?: LikePostResponseResolvers<ContextType>;
  LoginResponse?: LoginResponseResolvers<ContextType>;
  LogoutResponse?: LogoutResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Post?: PostResolvers<ContextType>;
  PostConnection?: PostConnectionResolvers<ContextType>;
  PostEdge?: PostEdgeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RefreshResponse?: RefreshResponseResolvers<ContextType>;
  RegisterResponse?: RegisterResponseResolvers<ContextType>;
  RequestPasswordResetResponse?: RequestPasswordResetResponseResolvers<ContextType>;
  StorageInfo?: StorageInfoResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  UpdateProfileResponse?: UpdateProfileResponseResolvers<ContextType>;
  UpdateThemePreferenceResponse?: UpdateThemePreferenceResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  ValidatePasswordResetTokenResponse?: ValidatePasswordResetTokenResponseResolvers<ContextType>;
};
