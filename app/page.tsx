'use client';

import { useState } from 'react';
import { trpc } from './providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    artist: '',
    genre: '',
    instrument: '',
    difficulty: undefined as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | undefined,
  });
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = trpc.search.search.useQuery({
    q: searchQuery || undefined,
    artist: filters.artist || undefined,
    genre: filters.genre || undefined,
    instrument: filters.instrument || undefined,
    difficulty: filters.difficulty,
    page,
    limit: 20,
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold">GPDownloader</h1>
        <p className="text-lg text-muted-foreground">
          Download and share Guitar Pro tabs
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search Tabs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search by title or artist..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full"
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Input
                placeholder="Artist"
                value={filters.artist}
                onChange={(e) => {
                  setFilters({ ...filters, artist: e.target.value });
                  setPage(1);
                }}
              />
              <Input
                placeholder="Genre"
                value={filters.genre}
                onChange={(e) => {
                  setFilters({ ...filters, genre: e.target.value });
                  setPage(1);
                }}
              />
              <Input
                placeholder="Instrument"
                value={filters.instrument}
                onChange={(e) => {
                  setFilters({ ...filters, instrument: e.target.value });
                  setPage(1);
                }}
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.difficulty || ''}
                onChange={(e) => {
                  setFilters({
                    ...filters,
                    difficulty: e.target.value
                      ? (e.target.value as typeof filters.difficulty)
                      : undefined,
                  });
                  setPage(1);
                }}
              >
                <option value="">All Difficulties</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && <div className="text-center">Loading...</div>}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Error: {error.message}
        </div>
      )}

      {data && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Found {data.pagination.total} tabs
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.tabs.map((tab) => (
              <Card key={tab.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link
                      href={`/tabs/${tab.id}`}
                      className="hover:underline"
                    >
                      {tab.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Artist:</span> {tab.artist.name}
                    </div>
                    {tab.difficulty && (
                      <div>
                        <span className="font-medium">Difficulty:</span>{' '}
                        {tab.difficulty}
                      </div>
                    )}
                    {tab.genre && (
                      <div>
                        <span className="font-medium">Genre:</span> {tab.genre}
                      </div>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Downloads: {tab.downloadCount}</span>
                      <span>Favorites: {tab._count.favorites}</span>
                      <span>Ratings: {tab._count.ratings}</span>
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
            <div className="mt-8 flex justify-center gap-2">
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
                onClick={() =>
                  setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                }
                disabled={page === data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
