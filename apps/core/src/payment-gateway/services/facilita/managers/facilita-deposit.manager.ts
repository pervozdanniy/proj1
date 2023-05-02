//import { UserService } from '@/user/services/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { ContributionResponse, MakeDepositRequest } from '~common/grpc/interfaces/payment-gateway';

@Injectable()
export class FacilitaDepositManager {
  private readonly logger = new Logger(FacilitaDepositManager.name);
  private readonly url: string;
  private readonly username: string;
  private readonly password: string;
  constructor(
    // @InjectRepository(TransfersEntity)
    // private readonly depositEntityRepository: Repository<TransfersEntity>,

    // private userService: UserService,
    config: ConfigService<ConfigInterface>,
  ) {
    const { facilita_url } = config.get('app', { infer: true });
    const { username, password } = config.get('facilita', { infer: true });
    this.url = facilita_url;
    this.username = username;
    this.password = password;
  }

  async makeDeposit(request: MakeDepositRequest): Promise<ContributionResponse> {
    this.logger.log(request, this.username, this.password, this.url);

    return { contribution_id: 'some_id' };
  }
}
