import { SessionInterface } from '~common/session';
import { PreRegisteredSessionInterface } from './interfaces';

export const isPreRegistered = (session: SessionInterface): session is PreRegisteredSessionInterface =>
  !!(session as PreRegisteredSessionInterface)?.register;
