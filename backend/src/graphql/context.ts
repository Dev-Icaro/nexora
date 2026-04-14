import { AuthService } from '@/services/auth.service';
import type { IAuthService } from '@/services/interfaces/auth.service.interface';

export interface GraphQLContext {
  dataSources: {
    authService: IAuthService;
  };
}

export const createContext = async (): Promise<GraphQLContext> => ({
  dataSources: {
    authService: new AuthService(),
  },
});
