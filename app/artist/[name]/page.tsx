'use client';

import { use, useState } from 'react';
import { trpc } from '@/app/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { TabListItem } from '@/lib/types';

export default function ArtistPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.search.search.useQuery({
    artist: decodedName,
    page,
    limit: 20,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-muted-foreground hover:underline mb-2 inline-block">
          ← Back to search
        </Link>
        <h1 className="text-3xl font-bold">{decodedName}</h1>
        <p className="text-muted-foreground">
          {data?.pagination.total || 0} tab{data?.pagination.total !== 1 ? 's' : ''} available
        </p>
      </div>

      {data && data.tabs.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {data.tabs.map((tab: TabListItem) => (
              <Card key={tab.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href={`/tabs/${tab.id}`} className="hover:underline">
                      {tab.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {tab.difficulty && (
                      <div>
                        <span className="text-muted-foreground">Difficulty:</span> {tab.difficulty}
                      </div>
                    )}
                    {tab.genre && (
                      <div>
                        <span className="text-muted-foreground">Genre:</span> {tab.genre}
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Downloads: {tab.downloadCount}</span>
                      <span>Favorites: {tab._count.favorites}</span>
                    </div>
                    <Link href={`/tabs/${tab.id}`}>
                      <Button className="mt-2 w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No tabs found for this artist</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
