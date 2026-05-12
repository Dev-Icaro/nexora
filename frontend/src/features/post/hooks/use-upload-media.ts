import { useMutation } from '@apollo/client/react';

import { uploadToS3 } from '@/shared/lib/s3';
import { toast } from '@/shared/lib/toast';

import { GET_UPLOAD_URL } from '../api/post.mutations';
import type { GetUploadUrlRequest, GetUploadUrlResponse } from '../api/post.types';

type UseUploadMediaResult = {
  uploadMedia: (file: File) => Promise<string | undefined>;
  uploading: boolean;
};

export function useUploadMedia(): UseUploadMediaResult {
  const [getUploadUrlMutation, { loading }] = useMutation<GetUploadUrlResponse, GetUploadUrlRequest>(GET_UPLOAD_URL);

  const uploadMedia = async (file: File): Promise<string | undefined> => {
    try {
      const result = await getUploadUrlMutation({
        variables: { request: { filename: file.name, contentType: file.type, fileSizeBytes: file.size } },
      });

      const data = result.data?.getUploadUrl;
      if (!data?.success || !data.uploadUrl || !data.fields || !data.objectKey) {
        toast.error(data?.message ?? 'Failed to get upload URL');
        return undefined;
      }

      const fields = JSON.parse(data.fields) as Record<string, string>;
      await uploadToS3(file, data.uploadUrl, fields);

      return data.objectKey;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Media upload failed');
      return undefined;
    }
  };

  return { uploadMedia, uploading: loading };
}
