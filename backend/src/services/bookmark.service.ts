import { NotFoundException } from '@/exceptions';
import { Bookmark } from '@/models/bookmark.model';
import { Post } from '@/models/post.model';

import type { IBookmarkService } from './interfaces/bookmark.service.interface';

export class BookmarkService implements IBookmarkService {
  async add(userId: string, postId: string): Promise<void> {
    const post = await Post.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const existing = await Bookmark.findOne({ userId, postId });
    if (existing) return;

    await Bookmark.create({ userId, postId });
  }

  async remove(userId: string, postId: string): Promise<void> {
    await Bookmark.deleteOne({ userId, postId });
  }
}
