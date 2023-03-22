import { SessionProxy } from '../session-host';

export type SessionMetadataOptions = {
  allowUnauthorized?: boolean;
};

export interface SessionInterface<User = any> extends Record<string | symbol, unknown> {
  user?: User;
}

export type WithSession<T, Session extends SessionInterface = SessionInterface> = T & {
  session: SessionProxy<Session>;
};
