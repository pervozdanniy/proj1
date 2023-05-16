import { Payload } from '@nestjs/microservices';
import { GrpcSession } from '~common/grpc-session';
import {
  ContactInfoServiceController,
  ContactInfoServiceControllerMethods,
  TwoFactorCode,
  TwoFactorVerificationResponse,
  Verification,
} from '~common/grpc/interfaces/auth';
import { SessionProxy } from '~common/session';
import { RpcController } from '~common/utils/decorators/rpc-controller.decorator';
import { ChangeContactInfoDto } from '../dto/change-contact-info.dto';
import { ApiContactInfoService } from '../services/contact-info.service';

@RpcController()
@ContactInfoServiceControllerMethods()
export class ApiContactInfoController implements ContactInfoServiceController {
  constructor(private readonly contactInfoService: ApiContactInfoService) {}
  changeContactInfoStart(@Payload() request: ChangeContactInfoDto, @GrpcSession() session: SessionProxy): Verification {
    return this.contactInfoService.changeContactStart(request, session);
  }

  changeContactInfoVerify(
    @Payload() request: TwoFactorCode,
    @GrpcSession() session: SessionProxy,
  ): Promise<TwoFactorVerificationResponse> {
    return this.contactInfoService.changeContactVerify(request, session);
  }
}
