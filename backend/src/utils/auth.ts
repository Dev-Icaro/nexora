import { createHmac } from 'node:crypto';

import jwt from 'jsonwebtoken';

import settings from '@/config/settings';

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

export interface IUserTokenInfo {
  userId: string;
}

/**
 * Creates an access token for the given user.
 *
 * @remarks
 * The access token is a JWT token signed using the HS512 algorithm.
 *
 * @param user - Information about the user.
 * @returns - The generated access token.
 */
export const createAccessToken = (user: IUserTokenInfo) => {
  return jwt.sign({ ...user }, ACCESS_TOKEN_SECRET!, {
    audience: 'urn:jwt:type:access',
    issuer: 'urn:system:token-issuer:type:access',
    expiresIn: `${settings.ACCESS_TOKEN_DURATION_MINUTES}m`,
  });
};

/**
 * Creates a refresh token for the given user.
 *
 * @remarks
 * The refresh token is a JWT token signed using the HS512 algorithm.
 *
 * @param user - Information about the user.
 * @returns - The generated refresh token.
 */
export const createRefreshToken = (user: IUserTokenInfo) => {
  return jwt.sign({ userId: user.userId }, REFRESH_TOKEN_SECRET!, {
    audience: 'urn:jwt:type:refresh',
    issuer: 'urn:system:token-issuer:type:refresh',
    expiresIn: `${settings.REFRESH_TOKEN_DURATION_MINUTES}m`,
  });
};

/**
 * Creates a hash for the given refresh token.
 *
 * @remarks
 * The hash is created using the SHA512 algorithm.
 *
 * @param token - The refresh token.
 * @returns - The hash of the refresh token.
 */
export const createHashForRefreshToken = (token: string) => {
  return createHmac('sha512', REFRESH_TOKEN_SECRET!).update(token).digest('hex');
};
