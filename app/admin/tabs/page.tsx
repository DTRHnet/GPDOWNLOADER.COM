'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { trpc } from '@/app/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminTabsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);

  const { data: tabs, isLoading, refetch } = trpc.admin.listTabs.useQuery({
    page,
    limit: 20,
  });

  const deleteTab = trpc.admin.deleteTab.useMutation({
    onSuccess: () => {
      toast({ title: 'Tab deleted successfully' });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete tab',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'MODERATOR')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">Access denied. Admin privileges required.</p>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manage Tabs</h1>
        <p className="text-muted-foreground">View and manage all tabs</p>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : tabs && tabs.tabs.length > 0 ? (
        <>
          <div className="space-y-4 mb-8">
            {tabs.tabs.map((tab: any) => (
              <Card key={tab.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/tabs/${tab.id}`} className="hover:underline">
                        <h3 className="font-medium text-lg">{tab.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {tab.artist.name} • {tab.downloadCount} downloads •{' '}
                        {new Date(tab.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this tab?')) {
                          deleteTab.mutate({ id: tab.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tabs.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {tabs.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(tabs.pagination.totalPages, p + 1))}
                disabled={page === tabs.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No tabs found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
