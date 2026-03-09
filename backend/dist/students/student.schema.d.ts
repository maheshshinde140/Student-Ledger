import { Document } from 'mongoose';
export type StudentDocument = Student & Document;
export declare class Student {
    name: string;
    email: string;
    age: number;
}
export declare const StudentSchema: import("mongoose").Schema<Student, import("mongoose").Model<Student, any, any, any, (Document<unknown, any, Student, any, import("mongoose").DefaultSchemaOptions> & Student & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Student, any, import("mongoose").DefaultSchemaOptions> & Student & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Student>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Student, Document<unknown, {}, Student, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    age?: import("mongoose").SchemaDefinitionProperty<number, Student, Document<unknown, {}, Student, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Student & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Student>;
