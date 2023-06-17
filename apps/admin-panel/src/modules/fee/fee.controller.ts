import { ApiGlobalResponse } from '@/common/decorators';
import { PM } from '@/constants/permission/map.permission';
import { ApiPaginatedResponse, PaginationParams, PaginationRequest, PaginationResponseDto } from '@/libs/pagination';
import { Permissions, TOKEN_NAME } from '@/modules/auth';
import { CreateFeeBodyDto } from '@/modules/fee/dtos/create-fee.body.dto';
import { FeeResponseDto } from '@/modules/fee/dtos/fee.response.dto';
import { UpdateFeeBodyDto } from '@/modules/fee/dtos/update-fee.body.dto';
import { FeeService } from '@/modules/fee/fee.service';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Fees')
@ApiBearerAuth(TOKEN_NAME)
@Controller({
  path: 'fees',
  version: '1',
})
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @ApiOperation({ description: 'Create a fee' })
  @ApiGlobalResponse(FeeResponseDto)
  @Permissions(PM.fees.create)
  @Post()
  createFee(@Body(ValidationPipe) fee: CreateFeeBodyDto): Promise<FeeResponseDto> {
    return this.feeService.createFee(fee);
  }

  @ApiOperation({ description: 'Get a paginated fee list' })
  @ApiPaginatedResponse(FeeResponseDto)
  @ApiQuery({
    name: 'filter',
    type: 'string',
    required: false,
    description: 'JSON String Where Key=Column Name, Value=Array of Values',
    example: '{ "id": [31, 35], "country": ["US"] }',
  })
  @Permissions(PM.fees.read)
  @Get()
  getFeeList(@PaginationParams() pagination: PaginationRequest): Promise<PaginationResponseDto<FeeResponseDto>> {
    return this.feeService.getFeeList(pagination);
  }

  @ApiOperation({ description: 'Update a fee by id' })
  @ApiGlobalResponse(FeeResponseDto)
  @Permissions(PM.fees.update)
  @Put('/:id')
  updateFee(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) fee: UpdateFeeBodyDto) {
    return this.feeService.updateFee(id, fee);
  }

  @ApiOperation({ description: 'Delete a fee by id' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Permissions(PM.fees.delete)
  @Delete('/:id')
  deleteFee(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.feeService.deleteFee(id);
  }
}
