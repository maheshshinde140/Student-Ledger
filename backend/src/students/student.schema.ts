import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, maxlength: 150 })
  email: string;

  @Prop({ required: true, min: 1, max: 120 })
  age: number;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
