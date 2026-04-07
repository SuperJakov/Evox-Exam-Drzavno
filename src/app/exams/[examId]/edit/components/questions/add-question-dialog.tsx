"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import {
	Check,
	Eye,
	HelpCircle,
	Image as ImageIcon,
	Loader2,
	Plus,
	Upload,
	X,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { type DragEvent, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import { getTokenFromClient } from "~/lib/auth-client";
import { getConvexSiteUrl } from "~/lib/convex-site-url";

export function AddQuestionDialog() {
	const params = useParams<{ examId: Id<"exams"> }>();
	const exam = useAuthedConvexQuery(api.exams.general.getExamDetails, {
		examId: params.examId,
	});
	const addQuestion = useMutation(api.exams.questions.addQuestion);
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [qText, setQText] = useState("");
	const [qType, setQType] = useState<
		"multiple_choice" | "short_answer" | "true_false"
	>("multiple_choice");
	const [qPoints, setQPoints] = useState("1");
	const [qOptions, setQOptions] = useState([
		{ id: crypto.randomUUID(), value: "" },
		{ id: crypto.randomUUID(), value: "" },
		{ id: crypto.randomUUID(), value: "" },
	]);
	const [qCorrectAnswer, setQCorrectAnswer] = useState("");
	const [qCorrectOptionId, setQCorrectOptionId] = useState<string | null>(null);
	const [qImage, setQImage] = useState<File | null>(null);
	const [qImagePreview, setQImagePreview] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	if (!exam) {
		return null;
	}

	const examId = exam._id;

	const resetForm = () => {
		setQText("");
		setQType("multiple_choice");
		setQPoints("1");
		setQOptions([
			{ id: crypto.randomUUID(), value: "" },
			{ id: crypto.randomUUID(), value: "" },
			{ id: crypto.randomUUID(), value: "" },
		]);
		setQCorrectAnswer("");
		setQCorrectOptionId(null);
		setQImage(null);
		if (qImagePreview) {
			URL.revokeObjectURL(qImagePreview);
		}
		setQImagePreview(null);
	};

	const handleImageSelect = (file: File | null) => {
		if (!file) return;

		// Validate file type
		const validTypes = ["image/jpeg", "image/png", "image/webp"];
		if (!validTypes.includes(file.type)) {
			alert("Please select a valid image file (JPEG, PNG, or WebP)");
			return;
		}

		// Validate file size (max 5MB)
		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			alert("Image size must be less than 5MB");
			return;
		}

		// Clean up previous preview
		if (qImagePreview) {
			URL.revokeObjectURL(qImagePreview);
		}

		setQImage(file);
		setQImagePreview(URL.createObjectURL(file));
	};

	const handleDragOver = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: DragEvent<HTMLElement>) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		if (file) {
			handleImageSelect(file);
		}
	};

	const handleRemoveImage = () => {
		if (qImagePreview) {
			URL.revokeObjectURL(qImagePreview);
		}
		setQImage(null);
		setQImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Validate multiple choice options
	const validateMultipleChoice = (): boolean => {
		if (qType !== "multiple_choice") return true;
		const nonEmptyOptions = qOptions.filter((o) => o.value.trim() !== "");
		return nonEmptyOptions.length >= 2;
	};

	const isCorrectAnswerSet =
		qType === "multiple_choice"
			? qCorrectOptionId !== null &&
				qOptions.find((o) => o.id === qCorrectOptionId)?.value.trim() !== ""
			: qCorrectAnswer.trim() !== "";

	const canSave =
		qText.trim() !== "" &&
		qPoints.trim() !== "" &&
		isCorrectAnswerSet &&
		validateMultipleChoice();

	const handleSave = async () => {
		if (!canSave) return;

		setIsSubmitting(true);
		try {
			let imageStorageId: Id<"_storage"> | undefined;

			if (qImage) {
				setIsUploading(true);
				const formData = new FormData();
				formData.append("file", qImage);

				const convexSiteUrl = getConvexSiteUrl();
				const uploadUrl = new URL("/upload-question-image", convexSiteUrl);

				const token = await getTokenFromClient();

				const response = await fetch(uploadUrl, {
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
					body: qImage,
				});

				if (!response.ok) {
					throw new Error("Failed to upload image");
				}

				const data = await response.json();
				imageStorageId = data.storageId as Id<"_storage">;
				setIsUploading(false);
			}

			const correctAnswer =
				qType === "multiple_choice"
					? qOptions.find((o) => o.id === qCorrectOptionId)?.value || ""
					: qCorrectAnswer;

			const options =
				qType === "multiple_choice"
					? qOptions.map((o) => o.value).filter((v) => v.trim() !== "")
					: undefined;

			await addQuestion({
				examId,
				text: qText,
				type: qType,
				points: parseInt(qPoints, 10) || 1,
				options,
				correctAnswer,
				image: imageStorageId,
			});

			setIsOpen(false);
			resetForm();
		} catch (error) {
			console.error("Failed to add question:", error);
		} finally {
			setIsSubmitting(false);
			setIsUploading(false);
		}
	};

	return (
		<Dialog
			onOpenChange={(open) => {
				if (open) resetForm();
				setIsOpen(open);
			}}
			open={isOpen}
		>
			<DialogTrigger asChild>
				{exam.isPublished ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="inline-block">
								<Button disabled onClick={resetForm}>
									<Plus className="mr-2 h-4 w-4" /> Add Question
								</Button>
							</span>
						</TooltipTrigger>
						<TooltipContent sideOffset={8}>
							<p>Cannot add questions to a published exam</p>
						</TooltipContent>
					</Tooltip>
				) : (
					<Button onClick={resetForm}>
						<Plus className="mr-2 h-4 w-4" /> Add Question
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="max-h-dvh w-[95vw] max-w-2xl overflow-y-auto p-4 sm:max-h-[90vh] sm:w-full sm:p-6">
				<DialogHeader>
					<DialogTitle>Add New Question</DialogTitle>
					<DialogDescription>
						Create a question for your exam.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="question-text">
							Question Text <span className="text-destructive">*</span>
						</Label>
						<Textarea
							id="question-text"
							onChange={(e) => setQText(e.target.value)}
							placeholder="What is the capital of France?"
							value={qText}
						/>
					</div>

					<div className="grid gap-2">
						<div className="flex items-center gap-1.5">
							<Label htmlFor="question-image">Image</Label>
							<Tooltip>
								<TooltipTrigger asChild>
									<HelpCircle className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
								</TooltipTrigger>
								<TooltipContent className="max-w-xs" side="right">
									<p className="text-sm">Click to upload or drag and drop</p>
									<p className="mt-1 text-muted-foreground text-xs">
										PNG, JPG or WebP (max 5MB)
									</p>
								</TooltipContent>
							</Tooltip>
						</div>

						{/* Hidden file input */}
						<input
							accept="image/jpeg,image/png,image/webp"
							className="hidden"
							id="question-image-input"
							onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
							ref={fileInputRef}
							type="file"
						/>

						{/* Custom drag-and-drop area */}
						{!qImage ? (
							<button
								className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-all duration-200 hover:border-primary hover:bg-accent/50 ${isDragging ? "scale-[0.98] border-primary bg-accent/50" : "border-muted-foreground/25"}`}
								onClick={() => fileInputRef.current?.click()}
								onDragLeave={handleDragLeave}
								onDragOver={handleDragOver}
								onDrop={handleDrop}
								type="button"
							>
								<Upload
									className={`h-8 w-8 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`}
								/>
							</button>
						) : (
							<div className="flex items-center justify-between rounded-lg border-2 border-border bg-accent/30 p-2">
								<div className="flex min-w-0 flex-1 items-center gap-2 px-1">
									<ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
									<span className="truncate font-medium text-sm">
										{qImage.name}
									</span>
								</div>

								<div className="flex items-center gap-1">
									<Popover>
										<PopoverTrigger asChild>
											<Button
												className="h-8 w-8 p-0"
												size="sm"
												type="button"
												variant="ghost"
											>
												<Eye className="h-4 w-4" />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											align="end"
											className="w-80 overflow-hidden p-0"
											side="top"
										>
											<div className="relative aspect-video bg-muted">
												{qImagePreview && (
													<Image
														alt="Question preview"
														className="object-contain"
														fill
														src={qImagePreview}
														unoptimized
													/>
												)}
											</div>
										</PopoverContent>
									</Popover>

									<Button
										className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
										onClick={handleRemoveImage}
										size="sm"
										type="button"
										variant="ghost"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label>Type</Label>
							<Select
								onValueChange={(
									v: "multiple_choice" | "short_answer" | "true_false",
								) => setQType(v)}
								value={qType}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="multiple_choice">
										Multiple Choice
									</SelectItem>
									<SelectItem value="short_answer">Short Answer</SelectItem>
									<SelectItem value="true_false">True / False</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label>
								Points <span className="text-destructive">*</span>
							</Label>
							<Input
								min="1"
								onChange={(e) => setQPoints(e.target.value)}
								type="number"
								value={qPoints}
							/>
						</div>
					</div>

					{qType === "multiple_choice" && (
						<div className="space-y-3">
							<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
								<Label>
									Options <span className="text-destructive">*</span>
								</Label>
								{!validateMultipleChoice() && (
									<span className="text-destructive text-xs">
										At least 2 options required
									</span>
								)}
							</div>
							<div className="grid gap-3">
								{qOptions.map((opt, idx) => {
									const isDuplicate =
										opt.value.trim() !== "" &&
										qOptions.some(
											(o, i) =>
												i !== idx &&
												o.value.trim() !== "" &&
												o.value.trim().toLowerCase() ===
													opt.value.trim().toLowerCase(),
										);

									return (
										<div className="flex items-center gap-2" key={opt.id}>
											<Input
												className={
													isDuplicate
														? "border-destructive focus-visible:ring-destructive"
														: ""
												}
												onChange={(e) => {
													const newOptions = [...qOptions];
													newOptions[idx] = {
														...opt,
														value: e.target.value,
													};
													setQOptions(newOptions);
												}}
												placeholder={`Option ${idx + 1}`}
												value={opt.value}
											/>
											<div className="flex items-center gap-1.5">
												<Tooltip>
													<TooltipTrigger asChild>
														<Button
															className={
																qCorrectOptionId === opt.id
																	? "bg-primary text-primary-foreground hover:bg-primary/90"
																	: ""
															}
															onClick={() => setQCorrectOptionId(opt.id)}
															size="icon"
															variant={
																qCorrectOptionId === opt.id
																	? "default"
																	: "outline"
															}
														>
															<Check className="h-4 w-4" strokeWidth={2.5} />
														</Button>
													</TooltipTrigger>
													<TooltipContent side="top">
														Mark as correct answer
													</TooltipContent>
												</Tooltip>

												<Button
													className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
													disabled={qOptions.length <= 2}
													onClick={() => {
														if (qOptions.length > 2) {
															const newOptions = qOptions.filter(
																(o) => o.id !== opt.id,
															);
															setQOptions(newOptions);
															if (qCorrectOptionId === opt.id) {
																setQCorrectOptionId(null);
															}
														}
													}}
													size="icon"
													variant="ghost"
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										</div>
									);
								})}
							</div>

							{qOptions.length < 7 && (
								<Button
									className="w-full border-dashed"
									onClick={() => {
										if (qOptions.length < 7) {
											setQOptions([
												...qOptions,
												{ id: crypto.randomUUID(), value: "" },
											]);
										}
									}}
									variant="outline"
								>
									<Plus className="mr-2 h-4 w-4" /> Add Option
								</Button>
							)}
						</div>
					)}

					{qType === "true_false" && (
						<div className="grid gap-2">
							<Label>
								Correct Answer <span className="text-destructive">*</span>
							</Label>
							<div className="flex gap-2">
								<Button
									className="flex-1"
									onClick={() => setQCorrectAnswer("true")}
									type="button"
									variant={qCorrectAnswer === "true" ? "default" : "outline"}
								>
									True
								</Button>
								<Button
									className="flex-1"
									onClick={() => setQCorrectAnswer("false")}
									type="button"
									variant={qCorrectAnswer === "false" ? "default" : "outline"}
								>
									False
								</Button>
							</div>
						</div>
					)}

					{qType === "short_answer" && (
						<div className="grid gap-2">
							<Label>
								Correct Answer (for auto-grading){" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input
								onChange={(e) => setQCorrectAnswer(e.target.value)}
								placeholder="Expected answer"
								value={qCorrectAnswer}
							/>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						disabled={isSubmitting}
						onClick={() => setIsOpen(false)}
						variant="outline"
					>
						Cancel
					</Button>
					<Button
						disabled={isSubmitting || isUploading || !canSave}
						onClick={handleSave}
					>
						{(isSubmitting || isUploading) && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Save Question
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
