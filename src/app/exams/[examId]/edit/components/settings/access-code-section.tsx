"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	CheckCheck,
	CheckCircle,
	Clock,
	Copy,
	Info,
	Loader2,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";

interface AccessCodeSectionProps {
	exam: {
		accessCode?: string;
		codeExpiresAt?: number;
		isPublished: boolean;
	};
	onDeactivateCode: () => Promise<void>;
	onActivateCode: () => void;
	isDeactivating: boolean;
}

export function AccessCodeSection({
	exam,
	onDeactivateCode,
	onActivateCode,
	isDeactivating,
}: AccessCodeSectionProps) {
	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
	const [isCopied, setIsCopied] = useState(false);

	const isCodeActive = !!exam.accessCode && !!exam.codeExpiresAt;

	useEffect(() => {
		if (!exam.codeExpiresAt) {
			setTimeRemaining(null);
			return;
		}

		const expiresAt = exam.codeExpiresAt;
		const updateTimer = () => {
			const now = Date.now();
			const remaining = expiresAt - now;
			setTimeRemaining(remaining > 0 ? remaining : 0);
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);
		return () => clearInterval(interval);
	}, [exam.codeExpiresAt]);

	const formatTimeRemaining = (ms: number) => {
		const totalSeconds = Math.floor(ms / 1000);
		const h = Math.floor(totalSeconds / 3600);
		const m = Math.floor((totalSeconds % 3600) / 60);
		const s = totalSeconds % 60;
		const parts = [];
		if (h > 0) parts.push(`${h}h`);
		if (m > 0) parts.push(`${m}m`);
		if (s > 0 || parts.length === 0) parts.push(`${s}s`);
		return parts.join(" ");
	};

	const handleCopyCode = async () => {
		if (!exam.accessCode) return;
		try {
			await navigator.clipboard.writeText(exam.accessCode);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy code:", err);
		}
	};

	return (
		<div className="space-y-3">
			<Label className="font-semibold text-foreground text-xs uppercase tracking-wider">
				Access Code
			</Label>

			<div className="flex flex-col gap-3">
				{/* Access Code Display - Always present when active */}
				<AnimatePresence initial={false} mode="wait">
					{isCodeActive && (
						<motion.div
							animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
							className="overflow-hidden"
							exit={{ opacity: 0, height: 0, marginBottom: 0 }}
							initial={{ opacity: 0, height: 0, marginBottom: 0 }}
							key="access-code-display"
							transition={{ duration: 0.3, ease: "easeInOut" }}
						>
							<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
								<div className="flex flex-col">
									<span className="text-[10px] text-muted-foreground uppercase">
										Current Code
									</span>
									<code className="font-bold font-mono text-foreground text-lg tracking-wider">
										{exam.accessCode}
									</code>
								</div>
								<Button
									className="h-9 w-9"
									onClick={handleCopyCode}
									size="icon"
									variant="ghost"
								>
									<AnimatePresence mode="wait">
										{isCopied ? (
											<motion.div
												animate={{ scale: 1, rotate: 0 }}
												exit={{ scale: 0, rotate: 180 }}
												initial={{ scale: 0, rotate: -180 }}
												key="copied"
												transition={{ duration: 0.2 }}
											>
												<CheckCheck className="h-4 w-4 text-emerald-500" />
											</motion.div>
										) : (
											<motion.div
												animate={{ scale: 1, rotate: 0 }}
												exit={{ scale: 0, rotate: 180 }}
												initial={{ scale: 0, rotate: -180 }}
												key="copy"
												transition={{ duration: 0.2 }}
											>
												<Copy className="h-4 w-4 text-muted-foreground" />
											</motion.div>
										)}
									</AnimatePresence>
								</Button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Status Badge - Always present */}
				<motion.div
					animate={{
						borderColor: isCodeActive
							? "rgba(16, 185, 129, 0.2)"
							: "hsl(var(--muted))",
						backgroundColor: isCodeActive
							? "rgba(16, 185, 129, 0.1)"
							: "hsl(var(--muted) / 0.5)",
					}}
					className="group relative flex items-center gap-2 rounded-full border px-3 py-1"
					initial={false}
					layout
					transition={{ duration: 0.4, ease: "easeInOut" }}
				>
					<motion.div
						animate={{
							backgroundColor: isCodeActive
								? "rgb(16, 185, 129)"
								: "var(--muted-foreground)",
							scale: isCodeActive ? [1, 1.2, 1] : 1,
						}}
						className="h-2 w-2 rounded-full"
						initial={false}
						transition={{
							backgroundColor: { duration: 0.4 },
							scale: isCodeActive
								? { duration: 1.5, repeat: Number.POSITIVE_INFINITY }
								: { duration: 0.3 },
						}}
					/>

					<AnimatePresence initial={false} mode="wait">
						{isCodeActive ? (
							<motion.div
								animate={{ opacity: 1, x: 0 }}
								className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
								exit={{ opacity: 0, x: 10 }}
								initial={{ opacity: 0, x: -10 }}
								key="active-content"
								transition={{ duration: 0.3 }}
							>
								<span className="whitespace-nowrap font-medium text-xs">
									Active Now
								</span>
								{timeRemaining !== null && timeRemaining > 0 && (
									<>
										<span className="text-emerald-500/30">|</span>
										<div className="flex items-center gap-1.5 whitespace-nowrap font-medium text-xs">
											<Clock className="h-3 w-3" />
											<span>{formatTimeRemaining(timeRemaining)} left</span>
										</div>
									</>
								)}
								<Info className="ml-0.5 h-3 w-3 cursor-help opacity-70 transition-opacity hover:opacity-100" />

								<div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 scale-95 rounded-lg border bg-popover p-2 text-[11px] text-popover-foreground opacity-0 shadow-md transition-all group-hover:scale-100 group-hover:opacity-100">
									<p className="leading-tight">
										Anyone can join using this access code in the next{" "}
										<span className="font-bold">
											{timeRemaining !== null
												? formatTimeRemaining(timeRemaining)
												: "remaining time"}
										</span>
										.
									</p>
									<div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b bg-popover" />
								</div>
							</motion.div>
						) : (
							<motion.span
								animate={{ opacity: 1, x: 0 }}
								className="font-medium text-muted-foreground text-xs"
								exit={{ opacity: 0, x: 10 }}
								initial={{ opacity: 0, x: -10 }}
								key="inactive-content"
								transition={{ duration: 0.3 }}
							>
								Inactive
							</motion.span>
						)}
					</AnimatePresence>
				</motion.div>

				{/* Action Button */}
				<motion.div className="pt-1" layout>
					<AnimatePresence initial={false} mode="wait">
						{isCodeActive ? (
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								initial={{ opacity: 0, y: -10 }}
								key="deactivate-button"
								transition={{ duration: 0.3 }}
							>
								<Button
									className="w-full justify-center"
									disabled={isDeactivating}
									onClick={onDeactivateCode}
									size="sm"
									variant="outline"
								>
									{isDeactivating ? (
										<Loader2 className="mr-2 h-3 w-3 animate-spin" />
									) : (
										<XCircle className="mr-2 h-3 w-3" />
									)}
									Deactivate Code
								</Button>
							</motion.div>
						) : (
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								className="space-y-2"
								exit={{ opacity: 0, y: 10 }}
								initial={{ opacity: 0, y: -10 }}
								key="activate-button"
								transition={{ duration: 0.3 }}
							>
								<Button
									className="w-full"
									disabled={!exam.isPublished}
									onClick={onActivateCode}
									size="sm"
								>
									<CheckCircle className="mr-2 h-3 w-3" />
									Activate New Code
								</Button>
								<AnimatePresence initial={false}>
									{!exam.isPublished && (
										<motion.p
											animate={{ opacity: 1, height: "auto" }}
											className="overflow-hidden px-1 text-center text-muted-foreground text-xs"
											exit={{ opacity: 0, height: 0 }}
											initial={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.2 }}
										>
											Publish the exam to enable access codes
										</motion.p>
									)}
								</AnimatePresence>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</div>
		</div>
	);
}
