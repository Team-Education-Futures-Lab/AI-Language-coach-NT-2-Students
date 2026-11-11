import {z} from 'zod';
export const newsLessonSchema=z.object({summary:z.string().min(20).max(3000),questions:z.array(z.object({question:z.string().min(5).max(400),answer:z.string().min(2).max(700)})).length(3)});
export const newsReadingInput=z.discriminatedUnion('action',[
 z.object({action:z.literal('create'),text:z.string().trim().min(150).max(14000)}),
 z.object({action:z.literal('feedback'),lesson:newsLessonSchema,answers:z.array(z.string().trim().min(1).max(1200)).length(3)})
]);
export const newsFeedbackSchema=z.object({feedback:z.array(z.object({good:z.string().min(1).max(500),tip:z.string().min(1).max(500)})).length(3),nextStep:z.string().min(1).max(500)});
