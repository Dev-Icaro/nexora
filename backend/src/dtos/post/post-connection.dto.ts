import type PostDto from './post.dto';
import type { Connection } from '@/types/pagination';

type PostConnectionDto = Connection<PostDto>;

export default PostConnectionDto;
