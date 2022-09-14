import { LoginRequestDto, ValidateRequestDto } from './../auth.dto';
import { JwtService } from './jwt.service';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../auth.entity';
import { RegisterRequestDto } from '../auth.dto';
import {
  LoginResponse,
  RegisterResponse,
  ValidateResponse,
} from '../proto/auth';
import { validate } from 'class-validator';

@Injectable()
export class AuthService {
  @InjectRepository(Auth)
  private readonly repository: Repository<Auth>;

  @Inject(JwtService)
  private readonly JwtService: JwtService;

  public async register({
    email,
    password,
  }: RegisterRequestDto): Promise<RegisterResponse> {
    let auth: Auth = await this.repository.findOne({ where: { email } });

    if (auth) {
      return { status: HttpStatus.CONFLICT, error: ['Email already exists'] };
    }

    auth = new Auth();
    auth.email = email;
    auth.password = this.JwtService.encodePassword(password);

    await this.repository.save(auth);

    return { status: HttpStatus.CREATED, error: null };
  }

  public async login({
    email,
    password,
  }: LoginRequestDto): Promise<LoginResponse> {
    const auth: Auth = await this.repository.findOne({ where: { email } });

    if (!auth) {
      return {
        status: HttpStatus.NOT_FOUND,
        error: ['Email not found'],
        token: null,
      };
    }

    const isPasswordValid: boolean = this.JwtService.isPasswordValid(
      password,
      auth.password
    );

    if (!isPasswordValid) {
      return {
        status: HttpStatus.NOT_FOUND,
        error: ['Password wrong'],
        token: null,
      };
    }

    const token: string = this.JwtService.generateToken(auth);

    return { token, status: HttpStatus.OK, error: null };
  }
  public async validate({
    token,
  }: ValidateRequestDto): Promise<ValidateResponse> {
    const decoded: Auth = await this.JwtService.verify(token);

    if (!decoded) {
      return {
        status: HttpStatus.FORBIDDEN,
        error: ['Token is invalid'],
        userId: null,
      };
    }

    const auth: Auth = await this.JwtService.validateUser(decoded);

    if (!auth) {
      return {
        status: HttpStatus.CONFLICT,
        error: ['User not found'],
        userId: null,
      };
    }

    return { status: HttpStatus.OK, error: null, userId: decoded.id };
  }
}
