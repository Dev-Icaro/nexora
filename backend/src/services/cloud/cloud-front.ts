import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

import env from '@/config/environment';
import secrets from '@/config/secrets';

let privateKey: string;
async function getPrivateKey(): Promise<string> {
  if (privateKey) return privateKey;

  const smConfig: ConstructorParameters<typeof SecretsManagerClient>[0] = { region: env.AWS_CLOUDFRONT_REGION };
  if (secrets.AWS_ACCESS_KEY_ID && secrets.AWS_SECRET_ACCESS_KEY) {
    smConfig.credentials = { accessKeyId: secrets.AWS_ACCESS_KEY_ID, secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY };
  }
  const sm = new SecretsManagerClient(smConfig);
  const secret = await sm.send(
    new GetSecretValueCommand({
      SecretId: secrets.AWS_CLOUDFRONT_PRIVATE_KEY_SECRET_NAME,
    }),
  );
  privateKey = secret.SecretString!;
  return privateKey;
}

let cfClient: CloudFrontClient;
function getCloudFrontClient(): CloudFrontClient {
  if (cfClient) return cfClient;

  const cfConfig: ConstructorParameters<typeof CloudFrontClient>[0] = { region: env.AWS_CLOUDFRONT_REGION };
  if (secrets.AWS_ACCESS_KEY_ID && secrets.AWS_SECRET_ACCESS_KEY) {
    cfConfig.credentials = { accessKeyId: secrets.AWS_ACCESS_KEY_ID, secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY };
  }
  cfClient = new CloudFrontClient(cfConfig);
  return cfClient;
}

export async function signMediaUrl(confirmedKey: string): Promise<string> {
  const key = await getPrivateKey();

  return getSignedUrl({
    url: `${env.AWS_CLOUDFRONT_DOMAIN}/${confirmedKey}`,
    keyPairId: secrets.AWS_CLOUDFRONT_KEY_PAIR_ID,
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
      DistributionId: secrets.AWS_CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `${key}-${Date.now()}`,
        Paths: { Quantity: 1, Items: [`/${key}`] },
      },
    }),
  );
}
