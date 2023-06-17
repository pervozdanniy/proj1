import { IsJSON, IsOptional } from 'class-validator';

export class FilterDto {
  @IsOptional()
  @IsJSON()
  public filter: string; // @TODO: Restrict columns field names
}
