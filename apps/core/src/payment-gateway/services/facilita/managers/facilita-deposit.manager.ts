//import { UserService } from '@/user/services/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { TransferInfo } from '~common/grpc/interfaces/payment-gateway';
import { MakeDepositRequest } from '../../../interfaces/payment-gateway.interface';

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

  async makeDeposit(request: MakeDepositRequest): Promise<TransferInfo> {
    this.logger.log(request, this.username, this.password, this.url);

    return { fee: '0', amount: request.amount, currency: 'USD' };
  }
}
