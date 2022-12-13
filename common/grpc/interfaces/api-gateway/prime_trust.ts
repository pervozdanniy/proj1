import { Observable } from 'rxjs';

export interface Attributes {
  name: string;
  email: string;
  password: string;
}

export interface UserData {
  type: string;
  attributes: Attributes;
}

export interface CreateRequest {
  data: UserData;
}

export interface PrimeTrustUser {
  data: any;
}

export interface PaymentGatewayService {
  createUser(request: CreateRequest): Observable<PrimeTrustUser>;
}
