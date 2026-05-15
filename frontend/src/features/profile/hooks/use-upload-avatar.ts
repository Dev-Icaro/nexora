import { useMutation } from '@apollo/client/react';
import { useState } from 'react';

import { uploadToS3 } from '@/shared/lib/s3';
import { toast } from '@/shared/lib/toast';

import { GET_AVATAR_UPLOAD_URL } from '../api/profile.mutations';
import type { GetAvatarUploadUrlRequest, GetAvatarUploadUrlResponse } from '../api/profile.types';

export type PreparedAvatar = {
  objectKey: string;
  previewUrl: string;
};

type UseUploadAvatarResult = {
  uploadAvatar: (file: File) => Promise<PreparedAvatar | null>;
  loading: boolean;
};

export function useUploadAvatar(): UseUploadAvatarResult {
  const [loading, setLoading] = useState(false);

  const [getAvatarUploadUrl] = useMutation<GetAvatarUploadUrlResponse, GetAvatarUploadUrlRequest>(
    GET_AVATAR_UPLOAD_URL,
  );

  const uploadAvatar = async (file: File): Promise<PreparedAvatar | null> => {
    setLoading(true);
    try {
      const urlResult = await getAvatarUploadUrl({
        variables: { request: { filename: file.name, contentType: file.type, fileSizeBytes: file.size } },
      });

      const urlData = urlResult.data?.getAvatarUploadUrl;
      if (!urlData?.success || !urlData.uploadUrl || !urlData.fields || !urlData.objectKey) {
        toast.error(urlData?.message ?? 'Failed to get upload URL');
        return null;
      }

      const fields = JSON.parse(urlData.fields) as Record<string, string>;
      await uploadToS3(file, urlData.uploadUrl, fields);

      return { objectKey: urlData.objectKey, previewUrl: URL.createObjectURL(file) };
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Avatar upload failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadAvatar, loading };
}
