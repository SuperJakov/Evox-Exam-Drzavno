import type { api } from "convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type ExamDetails = FunctionReturnType<
	typeof api.exams.general.getExamDetails
>;
