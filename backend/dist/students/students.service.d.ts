import { Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentDocument } from './student.schema';
export declare class StudentsService {
    private readonly studentModel;
    constructor(studentModel: Model<StudentDocument>);
    private toResponse;
    findAll(): Promise<{
        id: any;
        name: any;
        email: any;
        age: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    findOne(id: string): Promise<{
        id: any;
        name: any;
        email: any;
        age: any;
        createdAt: any;
        updatedAt: any;
    }>;
    create(dto: CreateStudentDto): Promise<{
        id: any;
        name: any;
        email: any;
        age: any;
        createdAt: any;
        updatedAt: any;
    }>;
    update(id: string, dto: UpdateStudentDto): Promise<{
        id: any;
        name: any;
        email: any;
        age: any;
        createdAt: any;
        updatedAt: any;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}
