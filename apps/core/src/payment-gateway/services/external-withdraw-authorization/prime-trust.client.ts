import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigInterface } from '~common/config/configuration';
import { PrimeTrustHttpService } from '../../request/prime-trust-http.service';

@Injectable()
export class PrimeTrustClient {
  private readonly assetId: string;
  // private readonly assetType: string;
  private readonly baseUrl: string;

  private readonly logger = new Logger(PrimeTrustClient.name);

  constructor(config: ConfigService<ConfigInterface>, private readonly httpService: PrimeTrustHttpService) {
    const { prime_trust_url } = config.get('app');
    // const { skopaKoyweAccountId, skopaAccountId } = config.get('prime_trust', { infer: true });
    const { id } = config.get('asset');
    this.assetId = id;
    // this.assetType = type;
    this.baseUrl = prime_trust_url;
  }

  async getAccountOwner(accountId: string) {
    const contactData = await this.httpService.request({
      method: 'get',
      url: `${this.baseUrl}/v2/accounts/${accountId}?include=contacts`,
    });

    return contactData.data.included[0];
  }

  async assetWidthdraw(payload: {
    contactId: string;
    accountId: string;
    wallet: string;
    amount: string | number;
    hot: boolean;
  }) {
    const assetTransferMethodResponse = await this.httpService.request({
      method: 'post',
      url: `${this.baseUrl}/v2/asset-transfer-methods`,
      data: {
        data: {
          type: 'asset-transfer-methods',
          attributes: {
            label: 'Personal Wallet Address',
            'asset-id': this.assetId,
            'contact-id': payload.contactId,
            'account-id': payload.accountId,
            'wallet-address': payload.wallet,
            'transfer-direction': 'outgoing',
            'asset-transfer-type': 'ethereum',
            'single-use': true,
          },
        },
      },
    });
    const transferMethodId = assetTransferMethodResponse.data.data.id;
    const makeWithdrawalResponse = await this.httpService.request({
      method: 'post',
      url: `${this.baseUrl}/v2/asset-disbursements?include=asset-transfer-method,asset-transfer`,
      data: {
        data: {
          type: 'asset-disbursements',
          attributes: {
            'asset-id': this.assetId,
            'asset-transfer': {
              'asset-transfer-method-id': transferMethodId,
            },
            'unit-count': payload.amount,
            'account-id': payload.accountId,
            'contact-id': payload.contactId,
            'hot-transfer': payload.hot,
          },
        },
      },
    });

    let asset_transfer_id: string;
    makeWithdrawalResponse.data.included.map(async (t: { type: string; id: string }) => {
      if (t.type === 'asset-transfers') {
        asset_transfer_id = t.id;
      }
    });

    const getAssetInfo = await this.httpService.request({
      method: 'get',
      url: `${this.baseUrl}/v2/asset-transfers/${asset_transfer_id}?include=disbursement-authorization`,
    });
    const assetData = getAssetInfo.data.data;
    this.logger.debug('Asset Withdrawal', {
      id: assetData.id,
      type: assetData.type,
      attributes: assetData.attributes,
      disbursement_authorization: assetData.relationships['disbursement-authorization'],
    });

    if (process.env.NODE_ENV === 'dev') {
      await this.httpService.request({
        method: 'post',
        url: `${this.baseUrl}/v2/disbursement-authorizations/${assetData.relationships['disbursement-authorization'].data.id}/sandbox/verify-owner`,
        data: null,
      });
    }
  }

  async assetTransfer(fromAccountId: string, toAccountId: string, unit_count: number | string, hotStatus: boolean) {
    const formData = {
      data: {
        type: 'internal-asset-transfers',
        attributes: {
          'unit-count': unit_count,
          'asset-id': this.assetId,
          'from-account-id': fromAccountId,
          'to-account-id': toAccountId,
          'hot-transfer': hotStatus,
        },
      },
    };

    const transferFundsResponse = await this.httpService.request({
      method: 'post',
      url: `${this.baseUrl}/v2/internal-asset-transfers`,
      data: formData,
    });

    return {
      uuid: transferFundsResponse.data.data.id,
      status: transferFundsResponse.data.data.attributes['status'],
      created_at: transferFundsResponse.data.data.attributes['created-at'],
    };
  }
}
