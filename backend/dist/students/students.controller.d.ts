import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
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
