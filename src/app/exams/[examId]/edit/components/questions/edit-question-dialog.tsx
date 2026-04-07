"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useAtom } from "jotai";
import {
	Check,
	Eye,
	HelpCircle,
	Image as ImageIcon,
	Loader2,
	Pencil,
	Plus,
	Upload,
	X,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { type DragEvent, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
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
import { questionToEditAtom } from "../shared/atoms";

export function EditQuestionDialog() {
	const params = useParams<{ examId: Id<"exams"> }>();
	const exam = useAuthedConvexQuery(api.exams.general.getExamDetails, {
		examId: params.examId,
	});
	const [questionId, setQuestionId] = useAtom(questionToEditAtom);
	const updateQuestion = useMutation(api.exams.questions.updateQuestion);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [qText, setQText] = useState("");
	const [qType, setQType] = useState<
		"multiple_choice" | "short_answer" | "true_false"
	>("multiple_choice");
	const [qPoints, setQPoints] = useState("1");
	const [qOptions, setQOptions] = useState<{ id: string; value: string }[]>([]);
	const [qCorrectAnswer, setQCorrectAnswer] = useState("");
	const [qCorrectOptionId, setQCorrectOptionId] = useState<string | null>(null);
	const [qImage, setQImage] = useState<File | null>(null);
	const [qImagePreview, setQImagePreview] = useState<string | null>(null);
	const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
	const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const uploadAbortControllerRef = useRef<AbortController | null>(null);

	// Find the question being edited
	const question = exam?.questions.find((q) => q._id === questionId);

	// Load question data when dialog opens
	useEffect(() => {
		if (question) {
			// Clean up any existing preview URL before setting new state
			setQImagePreview((prev) => {
				if (prev) {
					URL.revokeObjectURL(prev);
				}
				return null;
			});

			setQText(question.text);
			setQType(question.type);
			setQPoints(question.points.toString());
			setQCorrectAnswer(question.correctAnswer);
			const imageUrl = question.imageUrl ?? null;
			setExistingImageUrl(imageUrl);
			setOriginalImageUrl(imageUrl);
			setQImage(null);

			if (question.type === "multiple_choice" && question.options) {
				const opts = question.options.map((opt) => ({
					id: crypto.randomUUID(),
					value: opt,
				}));
				setQOptions(opts);
				// Find the correct option ID
				const correctOpt = opts.find((o) => o.value === question.correctAnswer);
				setQCorrectOptionId(correctOpt?.id || null);
			} else {
				setQOptions([
					{ id: crypto.randomUUID(), value: "" },
					{ id: crypto.randomUUID(), value: "" },
					{ id: crypto.randomUUID(), value: "" },
				]);
				setQCorrectOptionId(null);
			}
		}
	}, [question]);

	// Cleanup blob URLs on unmount
	useEffect(() => {
		return () => {
			if (qImagePreview) {
				URL.revokeObjectURL(qImagePreview);
			}
		};
	}, [qImagePreview]);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			// Cancel any ongoing upload
			if (uploadAbortControllerRef.current) {
				uploadAbortControllerRef.current.abort();
			}

			// Clean up preview URL
			if (qImagePreview) {
				URL.revokeObjectURL(qImagePreview);
			}

			setQuestionId(null);
		}
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
		// Clear existing image URL when new image is selected
		setExistingImageUrl(null);
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
		setExistingImageUrl(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Helper function to normalize strings for comparison
	const normalizeString = (str: string): string => {
		return str.trim().toLowerCase().replace(/\s+/g, " ");
	};

	// Check for duplicate options
	const hasDuplicates = () => {
		if (qType !== "multiple_choice") return false;

		const nonEmptyOptions = qOptions
			.map((o) => o.value)
			.filter((v) => v.trim() !== "");

		const normalizedOptions = nonEmptyOptions.map(normalizeString);
		const uniqueOptions = new Set(normalizedOptions);

		return normalizedOptions.length !== uniqueOptions.size;
	};

	// Check if an option is a duplicate
	const isDuplicateOption = (
		opt: { id: string; value: string },
		idx: number,
	): boolean => {
		if (opt.value.trim() === "") return false;

		const normalized = normalizeString(opt.value);
		return qOptions.some(
			(o, i) =>
				i !== idx &&
				o.value.trim() !== "" &&
				normalizeString(o.value) === normalized,
		);
	};

	// Validate multiple choice options
	const validateMultipleChoice = (): boolean => {
		const nonEmptyOptions = qOptions.filter((o) => o.value.trim() !== "");
		return nonEmptyOptions.length >= 2 && !hasDuplicates();
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
		(qType !== "multiple_choice" || validateMultipleChoice());

	const handleSave = async () => {
		if (!canSave || !questionId || isSubmitting || isUploading) return;

		setIsSubmitting(true);

		try {
			let imageStorageId: Id<"_storage"> | undefined = question?.image;

			if (qImage) {
				setIsUploading(true);

				// Create abort controller for this upload
				const abortController = new AbortController();
				uploadAbortControllerRef.current = abortController;

				try {
					const convexSiteUrl = getConvexSiteUrl();
					const uploadUrl = new URL("/upload-question-image", convexSiteUrl);

					const token = await getTokenFromClient();

					const response = await fetch(uploadUrl, {
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": qImage.type,
						},
						body: qImage,
						signal: abortController.signal,
					});

					if (!response.ok) {
						throw new Error("Failed to upload image");
					}

					const data = await response.json();
					imageStorageId = data.storageId as Id<"_storage">;
				} catch (uploadError) {
					if (
						uploadError instanceof Error &&
						uploadError.name === "AbortError"
					) {
						// Upload was cancelled, don't proceed
						return;
					}
					// Restore original image URL on upload failure
					setExistingImageUrl(originalImageUrl);
					setQImage(null);
					if (qImagePreview) {
						URL.revokeObjectURL(qImagePreview);
					}
					setQImagePreview(null);
					throw uploadError;
				} finally {
					setIsUploading(false);
					uploadAbortControllerRef.current = null;
				}
			} else if (!existingImageUrl) {
				// Image was removed
				imageStorageId = undefined;
			}

			const correctAnswer =
				qType === "multiple_choice"
					? qOptions.find((o) => o.id === qCorrectOptionId)?.value || ""
					: qCorrectAnswer;

			const options =
				qType === "multiple_choice"
					? qOptions.map((o) => o.value).filter((v) => v.trim() !== "")
					: undefined;

			await updateQuestion({
				questionId,
				text: qText,
				type: qType,
				points: parseInt(qPoints, 10) || 1,
				options,
				correctAnswer,
				image: imageStorageId,
			});

			handleOpenChange(false);
		} catch (error) {
			console.error("Failed to update question:", error);
			alert("Failed to save question. Please try again.");
		} finally {
			setIsSubmitting(false);
			setIsUploading(false);
		}
	};

	const isPublished = exam?.isPublished ?? false;

	return (
		<Dialog onOpenChange={handleOpenChange} open={!!questionId}>
			<DialogContent className="max-h-dvh w-[95vw] max-w-2xl overflow-y-auto p-4 sm:max-h-[90vh] sm:w-full sm:p-6">
				<DialogHeader>
					<DialogTitle>Edit Question</DialogTitle>
					<DialogDescription>
						{isPublished
							? "You can only edit points and correct answers on a published exam."
							: "Update the question details."}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="question-text">
							Question Text <span className="text-destructive">*</span>
						</Label>
						<Textarea
							disabled={isPublished}
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
							disabled={isPublished}
							id="question-image-input"
							onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
							ref={fileInputRef}
							type="file"
						/>

						{/* Custom drag-and-drop area */}
						{!qImage && !existingImageUrl ? (
							<button
								className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-all duration-200 hover:border-primary hover:bg-accent/50 ${isDragging ? "scale-[0.98] border-primary bg-accent/50" : "border-muted-foreground/25"}`}
								disabled={isPublished}
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
						) : qImage ? (
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

									{/* Ability to replace/edit new image as well */}
									<Button
										className="h-8 w-8 p-0"
										disabled={isPublished}
										onClick={() => fileInputRef.current?.click()}
										size="sm"
										type="button"
										variant="ghost"
									>
										<Pencil className="h-4 w-4" />
									</Button>

									<Button
										className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
										disabled={isPublished}
										onClick={handleRemoveImage}
										size="sm"
										type="button"
										variant="ghost"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>
						) : existingImageUrl ? (
							<div className="flex items-center justify-between rounded-lg border-2 border-border bg-accent/30 p-2">
								<div className="flex min-w-0 flex-1 items-center gap-2 px-1">
									<ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
									<span className="truncate font-medium text-sm">
										Current image
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
												{/** biome-ignore lint/performance/noImgElement: No need to optimize with next/image*/}
												<img
													alt="Question"
													className="h-full w-full object-contain"
													src={existingImageUrl}
												/>
											</div>
										</PopoverContent>
									</Popover>

									<Button
										className="h-8 w-8 p-0"
										disabled={isPublished}
										onClick={() => fileInputRef.current?.click()}
										size="sm"
										type="button"
										variant="ghost"
									>
										<Pencil className="h-4 w-4" />
									</Button>

									<Button
										className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
										disabled={isPublished}
										onClick={handleRemoveImage}
										size="sm"
										type="button"
										variant="ghost"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>
						) : null}
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label>Type</Label>
							<Select
								disabled={isPublished}
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
								{hasDuplicates() && (
									<span className="text-destructive text-xs">
										Duplicate options detected
									</span>
								)}
								{!validateMultipleChoice() && !hasDuplicates() && (
									<span className="text-destructive text-xs">
										At least 2 options required
									</span>
								)}
							</div>
							<div className="grid gap-3">
								{qOptions.map((opt, idx) => {
									const isDuplicate = isDuplicateOption(opt, idx);

									return (
										<div className="flex items-center gap-2" key={opt.id}>
											<Input
												className={
													isDuplicate
														? "border-destructive focus-visible:ring-destructive"
														: ""
												}
												disabled={isPublished}
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
													disabled={isPublished || qOptions.length <= 2}
													onClick={() => {
														if (!isPublished && qOptions.length > 2) {
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

							{!isPublished && qOptions.length < 7 && (
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
						disabled={isSubmitting || isUploading}
						onClick={() => handleOpenChange(false)}
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
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
