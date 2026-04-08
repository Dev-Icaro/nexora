// GraphQLContext is extended per feature (e.g. authenticated user, dataloaders)
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GraphQLContext {}

export const createContext = async (): Promise<GraphQLContext> => {
  return {};
};
