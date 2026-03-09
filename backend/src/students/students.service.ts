import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student, StudentDocument } from './student.schema';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
  ) {}

  private toResponse(student: any) {
    return {
      id: student._id?.toString(),
      name: student.name,
      email: student.email,
      age: student.age,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  findAll() {
    return this.studentModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .then((students) => students.map((student) => this.toResponse(student)));
  }

  async findOne(id: string) {
    const student = await this.studentModel.findById(id).lean();
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return this.toResponse(student);
  }

  async create(dto: CreateStudentDto) {
    const existing = await this.studentModel
      .findOne({ email: dto.email })
      .lean();
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const student = await this.studentModel.create(dto);
    return this.toResponse(student.toObject());
  }

  async update(id: string, dto: UpdateStudentDto) {
    const student = await this.findOne(id);

    if (dto.email && dto.email !== student.email) {
      const emailTaken = await this.studentModel
        .findOne({ email: dto.email })
        .lean();
      if (emailTaken) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updated = await this.studentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!updated) {
      throw new NotFoundException('Student not found');
    }
    return this.toResponse(updated);
  }

  async remove(id: string) {
    const deleted = await this.studentModel.findByIdAndDelete(id).lean();
    if (!deleted) {
      throw new NotFoundException('Student not found');
    }
    return { deleted: true };
  }
}
