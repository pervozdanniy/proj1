import { SessionInterface } from '~common/session';

export interface BoundSessionInterface extends SessionInterface {
  socketId: string;
}
