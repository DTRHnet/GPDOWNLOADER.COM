'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { trpc } from '@/app/providers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';

export default function AdminUploadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | undefined>(undefined);

  const { data: uploads, isLoading, refetch } = trpc.admin.listUploads.useQuery({
    page,
    limit: 20,
    status: statusFilter,
  });

  const updateStatus = trpc.admin.updateUploadStatus.useMutation({
    onSuccess: () => {
      toast({ title: 'Upload status updated' });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Failed to update status',
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
        <h1 className="text-3xl font-bold mb-2">Review Uploads</h1>
        <p className="text-muted-foreground">Approve or reject pending uploads</p>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant={statusFilter === undefined ? 'default' : 'outline'}
          onClick={() => setStatusFilter(undefined)}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('PENDING')}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('APPROVED')}
        >
          Approved
        </Button>
        <Button
          variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('REJECTED')}
        >
          Rejected
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : uploads && uploads.uploads.length > 0 ? (
        <>
          <div className="space-y-4 mb-8">
            {uploads.uploads.map((upload: any) => (
              <Card key={upload.id}>
                <CardHeader>
                  <CardTitle>{upload.title || upload.filename}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-medium">Artist:</span> {upload.artistName || 'Unknown'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> {upload.status}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Uploaded by:</span> {upload.user.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(upload.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {upload.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateStatus.mutate({ id: upload.id, status: 'APPROVED' })}
                        disabled={updateStatus.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateStatus.mutate({ id: upload.id, status: 'REJECTED' })}
                        disabled={updateStatus.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {uploads.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {uploads.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(uploads.pagination.totalPages, p + 1))}
                disabled={page === uploads.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No uploads found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
