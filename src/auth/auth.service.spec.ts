import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    jwtService = { sign: jest.fn().mockReturnValue('mocked-jwt-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: JwtService, useValue: jwtService }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object for valid credentials', async () => {
      const user = await service.validateUser('test', 'test');
      expect(user).toEqual({ userId: 1, username: 'test' });
    });

    it('should return null for invalid credentials', async () => {
      const user = await service.validateUser('wrong', 'credentials');
      expect(user).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access_token', async () => {
      const user = { userId: 1, username: 'test' };
      const result = await service.login(user);
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'test',
        sub: 1,
      });
      expect(result).toEqual({ access_token: 'mocked-jwt-token' });
    });
  });
});
