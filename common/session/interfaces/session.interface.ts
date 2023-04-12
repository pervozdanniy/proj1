import { ForSocial, WithActive } from '../modifiers/auth/active/interfaces';
import { WithKYC } from '../modifiers/auth/kyc/interfaces';
import { SessionProxy } from '../session-host';

export type SessionMetadataOptions = ForSocial<
  WithActive<
    WithKYC<{
      allowUnauthorized?: boolean;
    }>
  >
>;

export interface SessionInterface<User = any> extends Record<string | symbol, unknown> {
  user?: User;
}

export type WithSession<T, Session extends SessionInterface = SessionInterface> = T & {
  session: SessionProxy<Session>;
};
