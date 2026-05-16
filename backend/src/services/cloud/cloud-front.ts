import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

import env from '@/config/environment';

let privateKey: string;
async function getPrivateKey(): Promise<string> {
  if (privateKey) return privateKey;
  const sm = new SecretsManagerClient({
    region: env.AWS_CLOUDFRONT_REGION,
  });
  const secret = await sm.send(
    new GetSecretValueCommand({
      SecretId: env.AWS_CLOUDFRONT_PRIVATE_KEY_SECRET_NAME,
    }),
  );
  privateKey = secret.SecretString!;
  return privateKey;
}

let cfClient: CloudFrontClient;
function getCloudFrontClient(): CloudFrontClient {
  if (!cfClient) cfClient = new CloudFrontClient({ region: env.AWS_CLOUDFRONT_REGION });
  return cfClient;
}

export async function signMediaUrl(confirmedKey: string): Promise<string> {
  const key = await getPrivateKey();

  return getSignedUrl({
    url: `${env.AWS_CLOUDFRONT_DOMAIN}/${confirmedKey}`,
    keyPairId: env.AWS_CLOUDFRONT_KEY_PAIR_ID,
    privateKey: key,
    dateLessThan: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
  });
}

/**
 * Creates a CloudFront invalidation for a single object key.
 *
 * @param key - The confirmed S3 object key (without leading slash).
 */
export async function invalidateMediaUrl(key: string): Promise<void> {
  await getCloudFrontClient().send(
    new CreateInvalidationCommand({
      DistributionId: env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `${key}-${Date.now()}`,
        Paths: { Quantity: 1, Items: [`/${key}`] },
      },
    }),
  );
}
