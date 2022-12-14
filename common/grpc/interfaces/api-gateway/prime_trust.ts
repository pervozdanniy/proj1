import { Observable } from 'rxjs';

export interface GetTokenRequest {
  user_id: number;
}

export interface Token {
  token: string;
}

export interface TokenData {
  data: Token;
}

export interface PaymentGatewayService {
  getToken(request: GetTokenRequest): Observable<TokenData>;
}
