import { REFRESH_TOKEN_NAME } from '@modules/auth/constants';
import * as cookie from 'cookie';
import { Response } from 'express';

export function prepareAuthCookie(response: Response, refreshToken: string, domain: string, maxAge: number) {
  const cookieOptions = getCommonCookiesOptions(domain);

  response.set('Set-Cookie', [
    cookie.serialize(REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      maxAge,
      ...cookieOptions,
    }),
  ]);
}

export function prepareLogoutCookie(response: Response, domain: string) {
  const cookieOptions = getCommonCookiesOptions(domain);

  response.set('Set-Cookie', [
    cookie.serialize(REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      expires: new Date(1),
      ...cookieOptions,
    }),
  ]);
}

export function getCommonCookiesOptions(domain: string): Partial<cookie.CookieSerializeOptions> {
  let options: Partial<cookie.CookieSerializeOptions> = {
    sameSite: process.env.NODE_ENV === 'dev' ? undefined : 'lax',
    secure: process.env.NODE_ENV !== 'dev',
    path: '/',
  };

  if (process.env.NODE_ENV !== 'dev') {
    options = {
      ...options,
      domain,
    };
  }

  return options;
}
