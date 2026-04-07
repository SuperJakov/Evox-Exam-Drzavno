"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface ExamTimerProps {
	startedAt: number;
	duration: number;
	isCompleted: boolean;
}

export function ExamTimerSkeleton() {
	return (
		<div className="flex min-h-[30px] animate-pulse items-center gap-2 font-bold font-mono text-base text-muted-foreground/30 sm:text-xl">
			<Clock className="hidden h-5 w-5 text-muted-foreground/20 sm:block" />
			<div className="h-5 w-[52px] rounded-md bg-muted/50 sm:h-7 sm:w-[70px]" />
		</div>
	);
}

export function ExamTimer({
	startedAt,
	duration,
	isCompleted,
}: ExamTimerProps) {
	const [timeLeft, setTimeLeft] = useState<number | null>(null);

	useEffect(() => {
		if (isCompleted) {
			setTimeLeft(0);
			return;
		}

		if (startedAt) {
			const endTime = startedAt + duration;

			// Calculate immediately
			const calculateRemaining = () =>
				Math.max(0, Math.floor((endTime - Date.now()) / 1000));

			setTimeLeft(calculateRemaining());

			const interval = setInterval(() => {
				setTimeLeft(calculateRemaining());
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [startedAt, duration, isCompleted]);

	if (timeLeft === null) {
		return <ExamTimerSkeleton />;
	}

	const formatTime = (seconds: number) => {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		if (h > 0) {
			return `${h}:${m.toString().padStart(2, "0")}:${s
				.toString()
				.padStart(2, "0")}`;
		}
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	return (
		<div
			className={`flex min-h-[30px] items-center gap-2 font-bold font-mono text-base sm:text-xl ${
				timeLeft < 300 ? "text-red-500" : ""
			}`}
		>
			<Clock className="hidden h-5 w-5 sm:block" />
			{formatTime(timeLeft)}
		</div>
	);
}
