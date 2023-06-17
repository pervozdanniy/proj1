import { Transfer, TransferList } from '~common/grpc/interfaces/admin_panel';

export class ResponseTransferListDto implements TransferList {
  transfers: Transfer[];
  total: number;
}
