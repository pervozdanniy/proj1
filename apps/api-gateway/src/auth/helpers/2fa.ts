import { ConflictException } from '@nestjs/common';
import { AuthData, TwoFactorVerificationResponse } from '~common/grpc/interfaces/auth';
import { TwoFactorVerifyResponseDto } from '../dto/2fa.reponse.dto';
import { AuthResponseDto } from '../dto/auth.response.dto';

export const parseAuthResponse = ({ verify, ...tokens }: AuthData): AuthResponseDto => {
  if (verify?.methods.length) {
    return {
      type: 'verification_required',
      verify: { methods: verify.methods },
      ...tokens,
    };
  }

  return { type: 'success', ...tokens };
};

export const parseVerificationResponse = (resp: TwoFactorVerificationResponse): TwoFactorVerifyResponseDto => {
  if (!resp.valid) {
    throw new ConflictException(resp.reason);
  }
  if (resp.unverified?.methods.length) {
    return {
      type: 'partially_accepted',
      verify: {
        methods: resp.unverified.methods,
      },
    };
  }

  return { type: 'completed' };
};
