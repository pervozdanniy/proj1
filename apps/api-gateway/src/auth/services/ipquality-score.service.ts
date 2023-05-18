import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import process from 'process';
import { lastValueFrom } from 'rxjs';
import { ConfigInterface } from '~common/config/configuration';
import { RegistrationStartRequestDto } from '../dto/registration.dto';

@Injectable()
export class IpqualityScoreService {
  private readonly api_key: string;
  constructor(private readonly httpService: HttpService, config: ConfigService<ConfigInterface>) {
    const { api_key } = config.get('ipqualityscore');
    this.api_key = api_key;
  }

  async checkPhone(phone: string) {
    if (process.env.NODE_ENV !== 'dev') {
      const phoneResponse = await lastValueFrom(
        this.httpService.get(`https://ipqualityscore.com/api/json/phone/${this.api_key}/${phone}`),
      );
      if (!phoneResponse.data.valid) {
        throw new HttpException('Invalid phone', HttpStatus.BAD_REQUEST);
      }
    }
  }

  async checkEmail(email: string) {
    if (process.env.NODE_ENV !== 'dev') {
      const emailResponse = await lastValueFrom(
        this.httpService.get(`https://ipqualityscore.com/api/json/email/${this.api_key}/${email}`),
      );
      if (!emailResponse.data.valid) {
        throw new HttpException('Invalid email', HttpStatus.BAD_REQUEST);
      }
    }
  }

  async checkIpAddress(ip: string) {
    // allow_public_access_points=true - Allows corporate and public connections like Institutions, Hotels, Businesses, Universities, etc.
    // mobile=true - Forces the IP to be scored as a mobile device. Passing the "user_agent" will automatically detect the device type.
    // fast=true - Speeds up the API response time. Not recommended.
    // strictness=0 - Uses the lowest strictness (0-3) for Fraud Scoring. Increasing this value will expand the tests we perform. Levels 2+ have a higher risk of false-positives. We recommend using level 0 or 1 for the best results.
    // lighter_penalties=true - Lowers scoring and proxy detection for mixed quality IP addresses to prevent false-positives.

    if (process.env.NODE_ENV !== 'dev') {
      const ipResponse = await lastValueFrom(
        this.httpService.get(
          `https://ipqualityscore.com/api/json/ip/${this.api_key}/${ip}?strictness=0&allow_public_access_points=true&fast=true&lighter_penalties=true&mobile=true`,
        ),
      );
      if (ipResponse.data.fraud_score > 50) {
        throw new HttpException('Invalid ip address', HttpStatus.BAD_REQUEST);
      }
    }
  }

  async checkUserData(payload: RegistrationStartRequestDto) {
    const { email, phone } = payload;
    //   let ipAddress = (request.headers['x-forwarded-for'] || request.connection.remoteAddress).toString();
    //   ipAddress = ipAddress.includes(':') ? ipAddress.split(':').slice(-1)[0] : ipAddress;
    await this.checkEmail(email);
    await this.checkPhone(phone);
    //  await this.checkIpAddress(ipAddress);
  }
}
