import {
  BankAccountParams,
  BankAccountsResponse,
  PrimeTrustData,
  TransferMethodRequest,
} from '~common/grpc/interfaces/payment-gateway';
import { UserEntity } from '../../../../user/entities/user.entity';
import { PaymentGatewayInterface } from '../../interfaces/payment-gateway.interface';
import { KoyweService } from '../../services/koywe/koywe.service';
import { PrimeTrustService } from '../../services/prime_trust/prime-trust.service';

export class ChilePaymentGateway implements PaymentGatewayInterface {
  private primeTrustService: PrimeTrustService;
  private koyweService: KoyweService;
  constructor(primeTrustService: PrimeTrustService, koyweService: KoyweService) {
    this.primeTrustService = primeTrustService;
    this.koyweService = koyweService;
  }

  getBankAccounts(request: number): Promise<BankAccountsResponse> {
    return this.primeTrustService.getBankAccounts(request);
  }
  addBankAccountParams(request: BankAccountParams): Promise<BankAccountParams> {
    return this.primeTrustService.addBankAccountParams(request);
  }

  createReference(request: UserEntity): Promise<PrimeTrustData> {
    return this.koyweService.createReference(request);
  }
  makeWithdrawal(request: TransferMethodRequest): Promise<PrimeTrustData> {
    return this.primeTrustService.makeWithdrawal(request);
  }
}
