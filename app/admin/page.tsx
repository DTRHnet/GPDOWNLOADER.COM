'use client';

import { useSession } from 'next-auth/react';
import { trpc } from '@/app/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, FileText, Upload, DollarSign } from 'lucide-react';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: analytics, isLoading } = trpc.admin.analytics.useQuery(
    { days: 30 },
    { enabled: !!session && (session.user?.role === 'ADMIN' || session.user?.role === 'MODERATOR') }
  );

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage content, users, and monetization</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tabs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : analytics?.overview.totalTabs || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : analytics?.overview.totalUsers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : analytics?.overview.totalDownloads || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : analytics?.overview.totalUploads || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/tabs">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Manage Tabs
              </Button>
            </Link>
            <Link href="/admin/uploads">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Review Uploads
              </Button>
            </Link>
            <Link href="/admin/ads">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Ads Panel
              </Button>
            </Link>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                The Ads Panel allows you to create and manage custom advertisements for monetization. 
                You can place ads in different positions (header, sidebar, footer) and track their performance.
              </p>
            </div>
          </CardContent>
        </Card>

        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle>Ad Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Impressions:</span>
                  <span className="font-medium">{analytics.adStats.impressions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Clicks:</span>
                  <span className="font-medium">{analytics.adStats.clicks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">CTR:</span>
                  <span className="font-medium">
                    {(analytics.adStats.ctr * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenue:</span>
                  <span className="font-medium">${analytics.adStats.revenue.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {analytics && analytics.recentTabs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Tabs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.recentTabs.slice(0, 5).map((tab) => (
                <div key={tab.id} className="flex justify-between items-center">
                  <Link href={`/tabs/${tab.id}`} className="hover:underline">
                    {tab.title} - {tab.artist.name}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {new Date(tab.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
