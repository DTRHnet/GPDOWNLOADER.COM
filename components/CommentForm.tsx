'use client';

import { useState } from 'react';
import { trpc } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function CommentForm({ tabId }: { tabId: string }) {
  const [content, setContent] = useState('');
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      setContent('');
      utils.comments.list.invalidate({ tabId });
      toast({ title: 'Comment posted' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to post comment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createComment.mutate({ tabId, content: content.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        maxLength={1000}
        className="flex-1"
      />
      <Button type="submit" disabled={!content.trim() || createComment.isPending}>
        Post
      </Button>
    </form>
  );
}
