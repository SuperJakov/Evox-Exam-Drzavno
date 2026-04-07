"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useSetAtom } from "jotai";
import { CheckCircle, Loader2, Lock, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import { formatDuration } from "~/lib/duration";
import {
	isActivateDialogOpenAtom,
	isDurationDialogOpenAtom,
} from "../shared/atoms";
import { AccessCodeSection } from "./access-code-section";

export function ExamSettings() {
	const params = useParams<{ examId: Id<"exams"> }>();
	const exam = useAuthedConvexQuery(api.exams.general.getExamDetails, {
		examId: params.examId,
	});

	const publishExam = useMutation(api.exams.general.publishExam);

	// Check if exam has submissions for unpublish prevention
	const hasSubmissions = useAuthedConvexQuery(
		api.exams.general.hasSubmissions,
		exam ? { examId: exam._id } : "skip",
	);
	const setDurationDialogOpen = useSetAtom(isDurationDialogOpenAtom);
	const setActivateDialogOpen = useSetAtom(isActivateDialogOpenAtom);

	const deactivateAccessCode = useMutation(
		api.exams.access.deactivateAccessCode,
	);
	const updateExamBooleanSetting = useMutation(
		api.exams.settings.updateExamBooleanSetting,
	);

	const [isPublishing, setIsPublishing] = useState(false);
	const [isDeactivating, setIsDeactivating] = useState(false);
	const [loadingSetting, setLoadingSetting] = useState<string | null>(null);

	if (!exam) {
		return null;
	}

	const questionCount = exam.questions?.length ?? 0;
	const canPublish = questionCount > 0;
	// Only block unpublish if exam is published AND has submissions
	const canUnpublish = !exam.isPublished || !hasSubmissions;
	const isSettingDisabled = !!exam.accessCode;

	const handleDeactivateCode = async () => {
		setIsDeactivating(true);
		try {
			await deactivateAccessCode({ examId: exam._id });
		} catch (error) {
			console.error("Failed to deactivate code:", error);
		} finally {
			setIsDeactivating(false);
		}
	};

	const handlePublishToggle = async () => {
		setIsPublishing(true);
		try {
			await publishExam({ examId: exam._id, isPublished: !exam.isPublished });
		} catch (error) {
			console.error("Failed to toggle publish status:", error);
		} finally {
			setIsPublishing(false);
		}
	};

	type BooleanSettingKey =
		| "shuffleQuestions"
		| "shuffleAnswers"
		| "requireFullscreen"
		| "allowLateJoining"
		| "preventDuplicateAttempts";

	const handleToggleSetting = async (
		setting: BooleanSettingKey,
		value: boolean,
	) => {
		setLoadingSetting(setting);
		try {
			await updateExamBooleanSetting({
				examId: exam._id,
				setting,
				value,
			});
		} catch (error) {
			console.error(`Failed to toggle ${setting}:`, error);
		} finally {
			setLoadingSetting(null);
		}
	};

	type ToggleSetting = {
		id: string;
		label: string;
		description: string;
		setting: BooleanSettingKey;
		checked: boolean;
		tooltipMessage: string;
	};

	function SettingToggleRow({
		id,
		label,
		description,
		setting,
		checked,
		tooltipMessage,
	}: ToggleSetting) {
		const isLoading = loadingSetting === setting;

		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="flex items-center justify-between rounded-xl border bg-background p-4 shadow-xs">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<Label
										className="cursor-pointer font-bold text-sm"
										htmlFor={id}
									>
										{label}
									</Label>
								</div>
								<p className="max-w-[180px] text-[10px] text-muted-foreground leading-tight">
									{description}
								</p>
							</div>
							<div className="flex items-center gap-2">
								{isLoading && (
									<Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
								)}
								<Switch
									checked={checked}
									disabled={loadingSetting === setting || isSettingDisabled}
									id={id}
									onCheckedChange={(nextValue) =>
										handleToggleSetting(setting, nextValue)
									}
								/>
							</div>
						</div>
					</TooltipTrigger>
					{isSettingDisabled && (
						<TooltipContent sideOffset={10}>
							<p>{tooltipMessage}</p>
						</TooltipContent>
					)}
				</Tooltip>
			</TooltipProvider>
		);
	}

	const toggleSettings: ToggleSetting[] = [
		{
			id: "shuffle-toggle",
			label: "Shuffle Questions",
			description: "Randomize question order for each participant.",
			setting: "shuffleQuestions",
			checked: exam.shuffleQuestions ?? false,
			tooltipMessage:
				"Cannot change shuffle settings after access code is created.",
		},
		{
			id: "shuffle-answers-toggle",
			label: "Shuffle Answers",
			description: "Randomize answer options for multiple-choice questions.",
			setting: "shuffleAnswers",
			checked: exam.shuffleAnswers ?? false,
			tooltipMessage:
				"Cannot change shuffle settings after access code is created.",
		},
		{
			id: "fullscreen-toggle",
			label: "Require Fullscreen",
			description: "Force students to take the exam in fullscreen mode.",
			setting: "requireFullscreen",
			checked: exam.requireFullscreen,
			tooltipMessage:
				"Cannot change fullscreen setting after access code is created.",
		},
		{
			id: "late-joining-toggle",
			label: "Allow Late Joining",
			description: "Allow students to pause and resume the exam.",
			setting: "allowLateJoining",
			checked: exam.allowLateJoining ?? false,
			tooltipMessage:
				"Cannot change late joining setting after access code is created.",
		},
		{
			id: "duplicate-attempts-toggle",
			label: "Prevent Duplicate Attempts",
			description:
				"Block students from starting a new attempt after they have already completed the exam.",
			setting: "preventDuplicateAttempts",
			checked: exam.preventDuplicateAttempts ?? false,
			tooltipMessage:
				"Cannot change security settings after access code is created.",
		},
	];

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="space-y-6">
				{/* Basic info section */}
				<Card className="gap-y-0 overflow-hidden border-none bg-muted/40 shadow-none">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							General
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="space-y-1">
								<Label className="text-muted-foreground text-xs uppercase tracking-wider">
									Duration
								</Label>
								<p className="font-semibold text-lg">
									{formatDuration(exam.duration)}
								</p>
							</div>
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<span className="inline-block w-full sm:w-auto">
											<Button
												className="w-full sm:w-auto"
												disabled={isSettingDisabled}
												onClick={() => setDurationDialogOpen(true)}
												size="sm"
												variant="outline"
											>
												Change
											</Button>
										</span>
									</TooltipTrigger>
									{isSettingDisabled && (
										<TooltipContent sideOffset={8}>
											<p>
												Cannot change duration after access code is created.
											</p>
										</TooltipContent>
									)}
								</Tooltip>
							</TooltipProvider>
						</div>

						<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="space-y-1">
								<Label className="text-muted-foreground text-xs uppercase tracking-wider">
									Status
								</Label>
								<div className="flex items-center gap-2">
									{exam.isPublished ? (
										<div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs">
											<CheckCircle className="h-3.5 w-3.5" />
											Published
										</div>
									) : (
										<div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 font-medium text-muted-foreground text-xs">
											<XCircle className="h-3.5 w-3.5" />
											Draft
										</div>
									)}
								</div>
								<p className="mt-2 text-muted-foreground text-xs italic">
									{exam.isPublished
										? "Exam is live and can be taken by participants."
										: "Exam is currently hidden from participants."}
								</p>
								{questionCount === 0 && (
									<p className="mt-2 text-destructive text-xs">
										Add at least one question before publishing this exam.
									</p>
								)}
							</div>

							<div className="flex w-full items-center sm:w-auto">
								<TooltipProvider>
									{!canUnpublish || (!exam.isPublished && !canPublish) ? (
										<Tooltip>
											<TooltipTrigger asChild>
												<span className="inline-block w-full sm:w-auto">
													<Button
														className="h-auto w-full flex-wrap whitespace-normal text-center sm:h-9 sm:w-auto sm:flex-nowrap sm:whitespace-nowrap"
														disabled={
															isPublishing ||
															!canUnpublish ||
															(!exam.isPublished && !canPublish)
														}
														onClick={handlePublishToggle}
														variant={
															exam.isPublished ? "destructive" : "default"
														}
													>
														{isPublishing && (
															<Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
														)}
														{!canUnpublish && (
															<Lock className="mr-2 h-4 w-4 shrink-0" />
														)}
														{exam.isPublished
															? "Unpublish Exam"
															: !canPublish
																? "Add Questions First"
																: "Publish Exam"}
													</Button>
												</span>
											</TooltipTrigger>
											<TooltipContent sideOffset={8}>
												<p>
													{!exam.isPublished && !canPublish
														? "Add at least one question before publishing."
														: "Cannot unpublish an exam with existing submissions"}
												</p>
											</TooltipContent>
										</Tooltip>
									) : (
										<Button
											className="h-auto w-full flex-wrap whitespace-normal text-center sm:h-9 sm:w-auto sm:flex-nowrap sm:whitespace-nowrap"
											disabled={
												isPublishing ||
												!canUnpublish ||
												(!exam.isPublished && !canPublish)
											}
											onClick={handlePublishToggle}
											variant={exam.isPublished ? "destructive" : "default"}
										>
											{isPublishing && (
												<Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
											)}
											{!canUnpublish && (
												<Lock className="mr-2 h-4 w-4 shrink-0" />
											)}
											{exam.isPublished
												? "Unpublish Exam"
												: !canPublish
													? "Add Questions First"
													: "Publish Exam"}
										</Button>
									)}
								</TooltipProvider>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Access code section */}
				<Card className="gap-y-0 overflow-hidden border-none bg-muted/40 shadow-none">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							Access Control
						</CardTitle>
					</CardHeader>
					<CardContent>
						<AccessCodeSection
							exam={exam}
							isDeactivating={isDeactivating}
							onActivateCode={() => setActivateDialogOpen(true)}
							onDeactivateCode={handleDeactivateCode}
						/>
					</CardContent>
				</Card>
			</div>

			<div className="space-y-6">
				{/* Integrity section */}
				<Card className="gap-y-0 overflow-hidden border-none bg-muted/40 shadow-none">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							Security & Integrity
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{toggleSettings.map((setting) => (
							<SettingToggleRow key={setting.id} {...setting} />
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
