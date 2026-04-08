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
correct repository from ioc container and then making the correct request, avoiding aways as possible
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

## 2.0 - IoC

As dependency injection container, we use inversify, all related definitions should be located at @/ioc folder, we do not
have to abstract all the things in the application, just the important peaces, like database access, or external tool access
to avoid breaking some thing in the future.
