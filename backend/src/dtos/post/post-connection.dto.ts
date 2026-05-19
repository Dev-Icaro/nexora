import type { Connection } from '@/dtos/shared';

import type PostDto from './post.dto';

type PostConnectionDto = Connection<PostDto>;

export default PostConnectionDto;
