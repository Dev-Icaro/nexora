# Architecture

These document explain how the main points of architecture works on these project
separated by section.

## 1.0 - Data Access

To Access data in the application we should always respect those layers:

GraphQL Resolvers -> Repositories -> Models

### 1.1 - Database

As database we use MongoDB with Mongoose driver and we use a repository layer to abstract
the data access with those drivers.

### 1.2 - Resolvers

GraphQL resolver should acts like a controller, thin as possible, in most of time just getting the
correct service from the GraphQL context and then making the correct request, avoiding aways as possible
to introduce N+1 queries.

### 1.3 - Repositories

The application uses a repository layer to abstract the integration with external dependencies, repository
layer can be used also with an database or an external service like an REST API or thing like that.

All repositories should be located at @/repositories, the file name convetion is <entityName>.repository.ts

To define a repository you should always define an interface with the I<EntityName>Repository explaining the contract
and then the repository should implement then, you can locate the interface in the same file as the repository for now.

### 1.4 - Models

The application have a model layer to define the contracts with databse, to define a model we should
always use mongoose.Schema method and export the defined model as default in this file.

All models should be located at @/models folder, the file name convention is <entityName>.model.ts

## 2.0 - GraphQL

In the project we use GraphQL with Apollo driver, all graphql related file are located in @/graphql folder.
Inside graphql folder we have mutations, queries, resolvers, and root files like context.ts and typeDefs.ts

mutations -> All mutations should be located there using always repository layer.
queries -> All queries should be located there using always repository layer.
resolvers -> All resolvers should be located there.
context.ts -> The graphql context definition should be located here.
typeDefs -> All typeDefs should be located here.

## 3.0 - Error Handling

The application uses a typed exception hierarchy to handle domain errors consistently across all resolvers.

### 3.1 - Exceptions

All exceptions are located at `@/exceptions`. Every domain error should extend `AppException`, which extends the native `Error` object and adds a `statusCode` property (default: 400).

Common exceptions available out of the box:

| Class                   | Status Code |
| ----------------------- | ----------- |
| `BadRequestException`   | 400         |
| `UnauthorizedException` | 401         |
| `ForbiddenException`    | 403         |
| `NotFoundException`     | 404         |
| `ConflictException`     | 409         |

## 4.0 - DataLoaders

The application uses DataLoaders to batch and deduplicate database queries within a single GraphQL request, preventing N+1 query problems in field resolvers.

All loaders are defined in `@/graphql/loaders.ts` via the `createLoaders()` factory, which returns a fresh set of DataLoader instances per request. They are wired into `GraphQLContext` under the `loaders` key inside `createContext`.

### 4.1 - How DataLoaders work

A DataLoader accumulates all `.load(key)` calls made during a single GraphQL tick and fires a single batch function with all collected keys. The batch function must:

1. Accept a `readonly` array of keys.
2. Fetch all matching records in one query (e.g. `Model.find({ field: { $in: keys } })`).
3. Return an array of values in the **exact same order** and **same length** as the input keys.

```typescript
// Example: batching comments by postId
new DataLoader(async (postIds: readonly string[]) => {
  const comments = await Comment.find({ postId: { $in: postIds } }).sort({ _id: 1 });
  const map = new Map(postIds.map((id) => [id, [] as typeof comments]));
  for (const comment of comments) map.get(String(comment.postId))?.push(comment);
  return postIds.map((id) => map.get(id) ?? []);
});
```

### 4.2 - When to use a DataLoader

When implementing a field resolver, evaluate whether it causes N+1 queries:

- **Use a DataLoader** when the field resolver fetches related data by a foreign key that will be repeated across multiple parent objects (e.g. `Post.comments`, `Post.likes`, `Comment.author`).
- **No DataLoader needed** when the resolver fetches a single document by its own ID (root queries like `getPost(postId)`).

If a new field resolver introduces a per-parent database query, add a corresponding loader to `createLoaders()` and call `loaders.<name>.load(parent.id)` from the resolver instead of querying the model directly.

## 5.0 - Services

The application uses a service layer to hold all business logic, keeping resolvers thin. All services are located at `@/services`, and their interfaces are located at `@/services/interfaces`.

Each service must implement its corresponding interface (e.g. `AuthService implements IAuthService`). Services are instantiated directly in the GraphQL context (`createContext`) and made available to resolvers via `context.dataSources`.

File naming convention:

- Implementation: `@/services/<name>.service.ts`
- Interface: `@/services/interfaces/<name>.service.interface.ts`
