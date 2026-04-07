"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

const questions = [
	{ id: 1, text: "What planet do we live on?", correct: true },
	{ id: 2, text: "How many moons does Mars have?", correct: false },
	{ id: 3, text: "What is the capital of France?", correct: true },
	{ id: 4, text: "Who painted the Mona Lisa?", correct: true },
];

export function ExamGradingAnimation() {
	const [currentStep, setCurrentStep] = useState(0);
	const [showGrade, setShowGrade] = useState(false);

	const totalSteps = questions.length + 2;

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentStep((prev) => {
				const next = prev + 1;
				if (next >= totalSteps) {
					setShowGrade(false);
					return 0;
				}
				if (next === questions.length + 1) {
					setShowGrade(true);
				}
				return next;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [totalSteps]);

	const correctCount = questions.filter((q) => q.correct).length;
	const grade = Math.round((correctCount / questions.length) * 100);

	return (
		<div className="w-full max-w-full sm:w-[400px]">
			{/* Stacked paper effect */}
			<div className="relative">
				{/* Back papers for depth effect */}
				<div className="absolute top-2 right-1 left-1 h-full rounded-lg border bg-card/80 shadow-sm" />
				<div className="absolute top-1 right-0.5 left-0.5 h-full rounded-lg border bg-card/90 shadow-sm" />

				{/* Main paper */}
				<div className="relative rounded-lg border bg-card px-6 py-5 shadow-xl">
					{/* Header */}
					<div className="relative mb-5 flex h-14 items-center justify-between border-foreground/10 border-b-2 pb-4">
						<div>
							<div className="font-bold text-base">General Knowledge</div>
							<div className="text-muted-foreground text-sm">Final Exam</div>
						</div>
						{/* Grade badge */}
						<div className="flex h-12 w-12 items-center justify-center">
							<AnimatePresence>
								{showGrade && (
									<motion.div
										animate={{ opacity: 1, scale: 1 }}
										className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
										exit={{ opacity: 0, scale: 0.8 }}
										initial={{ opacity: 0, scale: 0.5 }}
										transition={{ type: "spring", stiffness: 300, damping: 20 }}
									>
										{grade}%
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Questions */}
					<div className="relative space-y-1">
						{questions.map((question, index) => {
							const isAnswered = currentStep > index;
							const isCurrentlyAnswering = currentStep === index;

							return (
								<div
									className={`flex min-h-[38px] items-center justify-between rounded-md px-3 py-1 transition-colors duration-200 ${
										isCurrentlyAnswering ? "bg-accent" : ""
									}`}
									key={question.id}
								>
									<div className="flex items-center gap-3">
										<span className="w-7 font-semibold text-muted-foreground text-sm">
											Q{question.id}.
										</span>
										<span className="text-foreground text-sm">
											{question.text}
										</span>
									</div>

									{/* Icon container */}
									<div className="flex h-6 w-6 items-center justify-center">
										<AnimatePresence mode="wait">
											{isAnswered && (
												<motion.div
													animate={{ opacity: 1, scale: 1 }}
													exit={{ opacity: 0, scale: 0.5 }}
													initial={{ opacity: 0, scale: 0 }}
													transition={{
														type: "spring",
														stiffness: 500,
														damping: 25,
													}}
												>
													{question.correct ? (
														<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
															<Check className="h-3.5 w-3.5 text-primary-foreground" />
														</div>
													) : (
														<div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive">
															<X className="h-3.5 w-3.5 text-destructive-foreground" />
														</div>
													)}
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</div>
							);
						})}
					</div>

					{/* Score summary */}
					<div className="relative mt-5 flex items-center justify-between border-t pt-4">
						<span className="text-muted-foreground text-sm">Score</span>
						<div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
							<motion.div
								animate={{
									width: `${
										(questions
											.slice(0, Math.min(currentStep, questions.length))
											.filter((q) => q.correct).length /
											questions.length) *
										100
									}%`,
								}}
								className="h-full bg-primary"
								initial={{ width: "0%" }}
								transition={{ duration: 0.3 }}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
