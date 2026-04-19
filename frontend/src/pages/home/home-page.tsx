import { PostComposer } from '@/features/post/components/post-composer';

export function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="max-w-2xl w-full mx-auto px-4 py-6">
        <PostComposer />
      </div>
    </main>
  );
}
