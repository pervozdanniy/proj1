import { SessionInterface } from '~common/session';

export type ChangeContactData = {
  phone?: string;
  email?: string;
};

export type ChangeContactInfo<T extends SessionInterface> = T & {
  change: ChangeContactData;
};
