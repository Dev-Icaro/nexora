import type { Connection } from '@/dtos/shared';

import type UserDto from './user.dto';

type UserConnectionDto = Connection<UserDto>;

export default UserConnectionDto;
