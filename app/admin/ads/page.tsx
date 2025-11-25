'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { trpc } from '@/app/providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdsPanelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: 'CUSTOM' as 'ADSENSE' | 'CUSTOM' | 'FACEBOOK' | 'AMAZON',
    position: '',
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    script: '',
    isActive: true,
  });

  const { data: ads, isLoading, refetch } = trpc.ads.list.useQuery({
    page,
    limit: 20,
  });

  const createAd = trpc.ads.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Ad created successfully' });
      setIsCreateOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create ad',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateAd = trpc.ads.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Ad updated successfully' });
      setEditingAd(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Failed to update ad',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteAd = trpc.ads.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Ad deleted successfully' });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete ad',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      type: 'CUSTOM',
      position: '',
      title: '',
      content: '',
      imageUrl: '',
      linkUrl: '',
      script: '',
      isActive: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAd) {
      updateAd.mutate({ id: editingAd.id, ...formData });
    } else {
      createAd.mutate(formData);
    }
  };

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      type: ad.type,
      position: ad.position,
      title: ad.title || '',
      content: ad.content || '',
      imageUrl: ad.imageUrl || '',
      linkUrl: ad.linkUrl || '',
      script: ad.script || '',
      isActive: ad.isActive,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      deleteAd.mutate({ id });
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Ads Panel
          </h1>
          <p className="text-muted-foreground">Manage custom ads for monetization</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingAd(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAd ? 'Edit Ad' : 'Create New Ad'}</DialogTitle>
              <DialogDescription>
                Configure ad placement and content for monetization
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Ad Type
                </label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as typeof formData.type,
                    })
                  }
                  required
                >
                  <option value="ADSENSE">Google AdSense</option>
                  <option value="CUSTOM">Custom Ad</option>
                  <option value="FACEBOOK">Facebook Ad</option>
                  <option value="AMAZON">Amazon Ad</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="position" className="text-sm font-medium">
                  Position *
                </label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="header, sidebar, footer, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ad title"
                />
              </div>

              {formData.type === 'CUSTOM' && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium">
                      Content
                    </label>
                    <textarea
                      id="content"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Ad content text"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="imageUrl" className="text-sm font-medium">
                      Image URL
                    </label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="linkUrl" className="text-sm font-medium">
                      Link URL
                    </label>
                    <Input
                      id="linkUrl"
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </>
              )}

              {(formData.type === 'ADSENSE' || formData.type === 'FACEBOOK') && (
                <div className="space-y-2">
                  <label htmlFor="script" className="text-sm font-medium">
                    Ad Script
                  </label>
                  <textarea
                    id="script"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                    value={formData.script}
                    onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                    placeholder="Paste ad script code here"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active
                </label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                    setEditingAd(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createAd.isPending || updateAd.isPending}>
                  {editingAd ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading ads...</div>
      ) : ads && ads.ads.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ads.ads.map((ad) => (
              <Card key={ad.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{ad.title || ad.type}</CardTitle>
                      <CardDescription>
                        {ad.position} • {ad.isActive ? 'Active' : 'Inactive'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {ad.type}
                    </div>
                    <div>
                      <span className="font-medium">Impressions:</span> {ad.impressions}
                    </div>
                    <div>
                      <span className="font-medium">Clicks:</span> {ad.clicks}
                    </div>
                    <div>
                      <span className="font-medium">CTR:</span>{' '}
                      {ad.impressions > 0
                        ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                        : 0}
                      %
                    </div>
                    <div>
                      <span className="font-medium">Revenue:</span> ${ad.revenue.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {ads.pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {ads.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(ads.pagination.totalPages, p + 1))}
                disabled={page === ads.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No ads created yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
