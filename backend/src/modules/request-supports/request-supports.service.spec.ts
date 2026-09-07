import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RequestSupportsService } from './request-supports.service';
import { RequestSupport, Request } from '../../database/schemas';

describe('RequestSupportsService', () => {
  let service: RequestSupportsService;
  let mockSupportModel: any;
  let mockRequestModel: any;

  const validRequestId = '507f1f77bcf86cd799439011';
  const validUserId = '507f1f77bcf86cd799439012';
  const validTenantId = '507f1f77bcf86cd799439013';

  beforeEach(async () => {
    mockSupportModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn(),
    };

    mockRequestModel = {
      findById: jest.fn(),
      updateOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestSupportsService,
        { provide: getModelToken(RequestSupport.name), useValue: mockSupportModel },
        { provide: getModelToken(Request.name), useValue: mockRequestModel },
      ],
    }).compile();

    service = module.get<RequestSupportsService>(RequestSupportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add support if user has not supported yet', async () => {
    mockRequestModel.findById.mockResolvedValueOnce({ _id: validRequestId, tenantId: validTenantId });
    mockSupportModel.findOne.mockResolvedValueOnce(null);
    mockSupportModel.create.mockResolvedValueOnce(true);
    mockRequestModel.updateOne.mockResolvedValueOnce(true);
    mockRequestModel.findById.mockResolvedValueOnce({ supportsCount: 1 });

    const result = await service.toggleSupport(validRequestId, validUserId);
    expect(result.supported).toBe(true);
    expect(result.supportsCount).toBe(1);
    expect(mockSupportModel.create).toHaveBeenCalled();
  });

  it('should remove support if user already supported', async () => {
    mockRequestModel.findById.mockResolvedValueOnce({ _id: validRequestId, tenantId: validTenantId });
    mockSupportModel.findOne.mockResolvedValueOnce({ _id: '507f1f77bcf86cd799439014' });
    mockSupportModel.deleteOne.mockResolvedValueOnce(true);
    mockRequestModel.updateOne.mockResolvedValueOnce(true);
    mockRequestModel.findById.mockResolvedValueOnce({ supportsCount: 0 });

    const result = await service.toggleSupport(validRequestId, validUserId);
    expect(result.supported).toBe(false);
    expect(result.supportsCount).toBe(0);
    expect(mockSupportModel.deleteOne).toHaveBeenCalled();
  });
});
