import { Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  email_verified_at: Date;

  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}


export interface IdRequest {
  id: number;
}

export interface UserService {
  getById(data: IdRequest): Observable<User>;
}
