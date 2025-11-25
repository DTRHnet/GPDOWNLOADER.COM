'use client';

import { use } from 'react';
import { trpc } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Heart, Download, Star, MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { CommentForm } from '@/components/CommentForm';

export default function TabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const { toast } = useToast();
  const [rating, setRating] = useState<number | null>(null);

  const { data: tab, isLoading: tabLoading } = trpc.tabs.getById.useQuery({ id });
  const { data: favorite, refetch: refetchFavorite } = trpc.favorites.check.useQuery(
    { id },
    { enabled: !!session }
  );
  const { data: userRating } = trpc.ratings.get.useQuery(
    { tabId: id },
    { enabled: !!session }
  );
  const { data: comments, isLoading: commentsLoading } = trpc.comments.list.useQuery({
    tabId: id,
    page: 1,
    limit: 20,
  });

  const addFavorite = trpc.favorites.add.useMutation({
    onSuccess: () => {
      refetchFavorite();
      toast({ title: 'Added to favorites' });
    },
  });

  const removeFavorite = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      refetchFavorite();
      toast({ title: 'Removed from favorites' });
    },
  });

  const submitRating = trpc.ratings.submit.useMutation({
    onSuccess: (data) => {
      toast({ title: `Rated ${data.rating.value} stars` });
      setRating(data.rating.value);
    },
  });

  const utils = trpc.useUtils();
  
  const handleDownload = async () => {
    try {
      const result = await utils.tabs.getDownloadUrl.fetch({ id });
      window.open(result.url, '_blank');
      toast({ title: 'Download started' });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleFavorite = () => {
    if (favorite?.favorited) {
      removeFavorite.mutate({ id });
    } else {
      addFavorite.mutate({ id });
    }
  };

  const handleRating = (value: number) => {
    if (session) {
      submitRating.mutate({ tabId: id, value });
    } else {
      toast({
        title: 'Please sign in',
        description: 'You must be signed in to rate tabs',
      });
    }
  };

  if (tabLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!tab) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Tab not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Back to search
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{tab.title}</CardTitle>
              <p className="text-lg text-muted-foreground">
                by <Link href={`/artist/${tab.artist.name}`}>{tab.artist.name}</Link>
              </p>
            </div>
            <div className="flex gap-2">
              {session && (
                <Button
                  variant={favorite?.favorited ? 'default' : 'outline'}
                  size="icon"
                  onClick={handleFavorite}
                >
                  <Heart className={`h-4 w-4 ${favorite?.favorited ? 'fill-current' : ''}`} />
                </Button>
              )}
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {tab.difficulty && (
              <div>
                <span className="text-sm text-muted-foreground">Difficulty</span>
                <p className="font-medium">{tab.difficulty}</p>
              </div>
            )}
            {tab.genre && (
              <div>
                <span className="text-sm text-muted-foreground">Genre</span>
                <p className="font-medium">{tab.genre}</p>
              </div>
            )}
            {tab.instrument && (
              <div>
                <span className="text-sm text-muted-foreground">Instrument</span>
                <p className="font-medium">{tab.instrument}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-muted-foreground">Downloads</span>
              <p className="font-medium">{tab.downloadCount}</p>
            </div>
          </div>

          {tab.averageRating && tab.averageRating > 0 && (
            <div className="mb-6">
              <span className="text-sm text-muted-foreground">Average Rating</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(tab.averageRating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm">({tab.averageRating.toFixed(1)})</span>
              </div>
            </div>
          )}

          {session && (
            <div className="mb-6">
              <span className="text-sm text-muted-foreground block mb-2">Your Rating</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (rating || userRating?.value || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments?.pagination.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {session && (
            <div className="mb-4">
              <CommentForm tabId={id} />
            </div>
          )}
          {commentsLoading ? (
            <div>Loading comments...</div>
          ) : comments && comments.comments.length > 0 ? (
            <div className="space-y-4">
              {comments.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{comment.user.name || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No comments yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
