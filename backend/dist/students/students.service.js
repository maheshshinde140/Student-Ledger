"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const student_schema_1 = require("./student.schema");
let StudentsService = class StudentsService {
    studentModel;
    constructor(studentModel) {
        this.studentModel = studentModel;
    }
    toResponse(student) {
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
    async findOne(id) {
        const student = await this.studentModel.findById(id).lean();
        if (!student) {
            throw new common_1.NotFoundException('Student not found');
        }
        return this.toResponse(student);
    }
    async create(dto) {
        const existing = await this.studentModel
            .findOne({ email: dto.email })
            .lean();
        if (existing) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const student = await this.studentModel.create(dto);
        return this.toResponse(student.toObject());
    }
    async update(id, dto) {
        const student = await this.findOne(id);
        if (dto.email && dto.email !== student.email) {
            const emailTaken = await this.studentModel
                .findOne({ email: dto.email })
                .lean();
            if (emailTaken) {
                throw new common_1.BadRequestException('Email already exists');
            }
        }
        const updated = await this.studentModel
            .findByIdAndUpdate(id, dto, { new: true })
            .lean();
        if (!updated) {
            throw new common_1.NotFoundException('Student not found');
        }
        return this.toResponse(updated);
    }
    async remove(id) {
        const deleted = await this.studentModel.findByIdAndDelete(id).lean();
        if (!deleted) {
            throw new common_1.NotFoundException('Student not found');
        }
        return { deleted: true };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(student_schema_1.Student.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], StudentsService);
//# sourceMappingURL=students.service.js.map