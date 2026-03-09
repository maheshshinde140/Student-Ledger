import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from './student.schema';
import { StudentsService } from './students.service';

type ModelMock = Partial<Record<keyof Model<Student>, jest.Mock>>;

const createModelMock = (): ModelMock => ({
  findOne: jest.fn(),
  create: jest.fn(),
});

describe('StudentsService', () => {
  let service: StudentsService;
  let model: ModelMock;

  beforeEach(async () => {
    model = createModelMock();
    const module = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getModelToken(Student.name),
          useValue: model,
        },
      ],
    }).compile();

    service = module.get(StudentsService);
  });

  it('creates a student when email is unique', async () => {
    model.findOne!.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    model.create!.mockResolvedValue({
      toObject: () => ({ id: '1', name: 'A' }),
    });

    const result = await service.create({
      name: 'A',
      email: 'a@test.com',
      age: 20,
    });

    expect(model.findOne).toHaveBeenCalledWith({ email: 'a@test.com' });
    expect(result).toEqual({ id: '1', name: 'A' });
  });

  it('rejects duplicate emails on create', async () => {
    model.findOne!.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ id: 'existing' }),
    });

    await expect(
      service.create({ name: 'A', email: 'a@test.com', age: 20 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when student is not found', async () => {
    model.findById = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
