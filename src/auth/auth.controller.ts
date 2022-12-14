import { AuthService } from './service/auth.service';
import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AUTH_SERVICE_NAME,
  LoginResponse,
  RegisterResponse,
  ValidateResponse,
} from './proto/auth';
import {
  LoginRequestDto,
  RegisterRequestDto,
  ValidateRequestDto,
} from './auth.dto';

@Controller()
export class AuthController {
  @Inject(AuthService)
  private readonly service: AuthService;

  @GrpcMethod(AUTH_SERVICE_NAME, 'Register')
  private register(payload: RegisterRequestDto): Promise<RegisterResponse> {
    return this.service.register(payload);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Login')
  private login(payload: LoginRequestDto): Promise<LoginResponse> {
    return this.service.login(payload);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Validate')
  private validate(payload: ValidateRequestDto): Promise<ValidateResponse> {
    return this.service.validate(payload);
  }
}
