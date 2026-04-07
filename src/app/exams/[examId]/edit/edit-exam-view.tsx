"use client";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAtom } from "jotai";
import { BarChart3, ClipboardList, ListTodo, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Activity } from "react";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/use-auth";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import { cn } from "~/lib/utils";
import { ExamAnalytics } from "./components/analytics/exam-analytics";
import { ExamQuestions } from "./components/questions/exam-questions";
import { ExamSettings } from "./components/settings/exam-settings";
import { activeTabAtomFamily } from "./components/shared/atoms";
import { Sidebar } from "./components/sidebar/sidebar";
import { ExamResults } from "./components/submissions/exam-results";

const ActivateCodeDialog = dynamic(() =>
	import("./components/settings/activate-code-dialog").then(
		(mod) => mod.ActivateCodeDialog,
	),
);
const EditDurationDialog = dynamic(() =>
	import("./components/settings/edit-duration-dialog").then(
		(mod) => mod.EditDurationDialog,
	),
);

const tabs = [
	{
		value: "questions",
		label: "Questions",
		icon: ListTodo,
		content: <ExamQuestions />,
		className: "m-0 space-y-8",
	},
	{
		value: "results",
		label: "Submissions",
		icon: ClipboardList,
		content: <ExamResults />,
		className: "m-0",
	},
	{
		value: "settings",
		label: "Exam Settings",
		icon: Settings,
		content: <ExamSettings />,
		className: "m-0",
	},
	{
		value: "analytics",
		label: "Analytics",
		icon: BarChart3,
		content: <ExamAnalytics />,
		className: "m-0",
	},
];

export default function EditExamView() {
	const params = useParams();
	const examId = params.examId as string;
	const { user, isLoading } = useAuth();
	const [activeTab] = useAtom(activeTabAtomFamily(examId));

	const exam = useAuthedConvexQuery(api.exams.general.getExamDetails, {
		examId: params.examId as Id<"exams">,
	});
	const isPublished = exam?.isPublished ?? false;
	const hasActiveCode =
		!!exam?.accessCode &&
		!!exam?.codeExpiresAt &&
		exam.codeExpiresAt > Date.now();

	if (!isLoading && user && user.role !== "teacher") {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
				<h1 className="font-bold text-2xl tracking-tight">
					You don't have permission to view this page
				</h1>
				<Button asChild>
					<Link href="/">Go Home</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background md:flex-row">
			<Sidebar
				hasActiveCode={hasActiveCode}
				isPublished={isPublished}
				tabs={tabs}
			/>

			<main className="min-w-0 max-w-full flex-1 p-4 sm:p-6 md:p-8 lg:p-12">
				<div className="mx-auto w-full max-w-4xl">
					{tabs.map((tab) => {
						const isActive = activeTab === tab.value;
						return (
							<div
								className={cn(
									!isActive && "hidden",
									"fade-in-50 animate-in duration-300",
									tab.className,
								)}
								key={tab.value}
							>
								<Activity mode={isActive ? "visible" : "hidden"}>
									{tab.content}
								</Activity>
							</div>
						);
					})}
				</div>
			</main>

			<EditDurationDialog />
			<ActivateCodeDialog />
		</div>
	);
}
