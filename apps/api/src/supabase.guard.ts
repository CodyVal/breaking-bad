import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseGuard implements CanActivate {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseGuard.name);

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    this.supabase = this.initializeSupabase();
  }

  private initializeSupabase(): SupabaseClient {
    this.logger.log('Initializing Supabase client');

    if(!this.config.get('SUPABASE_URL')) {
      this.logger.error('SUPABASE_URL is not set');
      throw new Error('SUPABASE_URL is not set');
    }

    if(!this.config.get('SUPABASE_ANON_KEY')) {
      this.logger.error('SUPABASE_ANON_KEY is not set');
      throw new Error('SUPABASE_ANON_KEY is not set');
    }

    return createClient(this.config.get('SUPABASE_URL'), this.config.get('SUPABASE_ANON_KEY'));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [_, token] = request.headers.authorization?.split(' ') ?? [];

    if(!token) {
      this.logger.error('No token provided');
      return false;
    }

    const { data, error } = await this.supabase.auth.getUser(token);

    if(error) {
      this.logger.error('Error getting user', error);
      return false;
    }

    request.user = data.user;
    return true;
  }
}
