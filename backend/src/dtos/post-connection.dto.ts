import type PostDto from '@/dtos/post.dto';
import type { Connection } from '@/types/pagination';

type PostConnectionDto = Connection<PostDto>;

export default PostConnectionDto;
