const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 300;

type UploadAttemptResult = { ok: true } | { ok: false; retryable: boolean; error: Error };

async function performUpload(
  file: File,
  uploadUrl: string,
  fields: Record<string, string>,
): Promise<UploadAttemptResult> {
  const formData = new FormData();
  // Fields must come before the file — S3 presigned POST ignores everything after the file field
  for (const [key, value] of Object.entries(fields)) formData.append(key, value);
  formData.append('file', file);

  let response: Response;
  try {
    response = await fetch(uploadUrl, { method: 'POST', body: formData });
  } catch {
    return { ok: false, retryable: true, error: new Error('Network error during S3 upload') };
  }

  if (response.ok || response.status === 204) return { ok: true };
  if (response.status >= 500) {
    return { ok: false, retryable: true, error: new Error(`S3 upload failed with status ${response.status}`) };
  }

  const text = await response.text();
  return { ok: false, retryable: false, error: new Error(`S3 upload rejected (${response.status}): ${text}`) };
}

/**
 * Uploads a file to S3 using a presigned POST URL. Retries on 5xx and network errors
 * with exponential backoff. Fails immediately on 4xx responses.
 *
 * @param file - The File object to upload.
 * @param uploadUrl - The presigned POST URL returned by the backend.
 * @param fields - Form fields to include in the POST (from JSON-parsed backend response).
 * @throws {Error} If the upload fails after all retry attempts or the server returns a 4xx error.
 */
export async function uploadToS3(file: File, uploadUrl: string, fields: Record<string, string>): Promise<void> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise(resolve => setTimeout(resolve, BASE_DELAY_MS * 2 ** (attempt - 1)));

    const result = await performUpload(file, uploadUrl, fields);
    if (result.ok) return;
    if (!result.retryable) throw result.error;
    lastError = result.error;
  }

  throw lastError ?? new Error('S3 upload failed after retries');
}
