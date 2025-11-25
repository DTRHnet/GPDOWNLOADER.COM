'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { trpc } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload as UploadIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    artistName: '',
    instrument: '',
    genre: '',
    difficulty: '' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | '',
  });
  const [uploading, setUploading] = useState(false);

  const initiateUpload = trpc.uploads.initiate.useMutation();

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">Loading...</CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">Please sign in to upload tabs.</p>
            <Button onClick={() => router.push('/login')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 50MB',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      if (!metadata.title) {
        setMetadata({ ...metadata, title: selectedFile.name.replace(/\.[^/.]+$/, '') });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'No file selected',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Initiate upload
      const { url } = await initiateUpload.mutateAsync({
        filename: file.name,
        contentType: file.type || 'application/x-guitar-pro',
        sizeBytes: file.size,
        title: metadata.title || undefined,
        artistName: metadata.artistName || undefined,
        instrument: metadata.instrument || undefined,
        genre: metadata.genre || undefined,
        difficulty: metadata.difficulty || undefined,
      });

      // Upload file to S3
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/x-guitar-pro',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      toast({
        title: 'Upload successful',
        description: 'Your tab is pending approval',
      });

      router.push('/profile');
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload Guitar Pro Tab</CardTitle>
          <CardDescription>Upload a new tab file for review</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="file" className="text-sm font-medium">
                File (Guitar Pro format, max 50MB)
              </label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".gp,.gp3,.gp4,.gp5,.gpx"
                  onChange={handleFileChange}
                  disabled={uploading}
                  required
                />
                {file && (
                  <span className="text-sm text-muted-foreground">{file.name}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                placeholder="Song title"
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="artistName" className="text-sm font-medium">
                Artist Name
              </label>
              <Input
                id="artistName"
                value={metadata.artistName}
                onChange={(e) => setMetadata({ ...metadata, artistName: e.target.value })}
                placeholder="Artist name"
                disabled={uploading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="instrument" className="text-sm font-medium">
                  Instrument
                </label>
                <Input
                  id="instrument"
                  value={metadata.instrument}
                  onChange={(e) => setMetadata({ ...metadata, instrument: e.target.value })}
                  placeholder="Guitar, Bass, etc."
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="genre" className="text-sm font-medium">
                  Genre
                </label>
                <Input
                  id="genre"
                  value={metadata.genre}
                  onChange={(e) => setMetadata({ ...metadata, genre: e.target.value })}
                  placeholder="Rock, Metal, etc."
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="difficulty" className="text-sm font-medium">
                Difficulty
              </label>
              <select
                id="difficulty"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={metadata.difficulty}
                onChange={(e) =>
                  setMetadata({
                    ...metadata,
                    difficulty: e.target.value as typeof metadata.difficulty,
                  })
                }
                disabled={uploading}
              >
                <option value="">Select difficulty</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={!file || uploading}>
              <UploadIcon className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Tab'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
