import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseGuard } from 'src/supabase.guard';

@Controller('packages')
export class PackagesController {

  @Get('/')
  @UseGuards(SupabaseGuard)
  async getPackages() {
    return 'Hello World';
  }
}
