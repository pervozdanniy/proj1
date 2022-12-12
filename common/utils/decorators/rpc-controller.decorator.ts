import { applyDecorators, Controller, UseFilters } from '@nestjs/common';
import { AllExceptionFilter } from '../filters/all-exception.filter';
import { GrpcExceptionFilter } from '../filters/grpc-exception.filter';

export const RpcController = () =>
  applyDecorators(Controller(), UseFilters(new AllExceptionFilter(), new GrpcExceptionFilter()));
