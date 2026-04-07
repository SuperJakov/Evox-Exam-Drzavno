"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
	BarChart2,
	EyeOff,
	Loader2,
	MonitorOff,
	RefreshCw,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Scatter,
	ScatterChart,
	XAxis,
	YAxis,
	ZAxis,
} from "recharts";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "~/components/ui/chart";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { useAnalyticsBreakpoint } from "~/hooks/use-analytics-breakpoint";

const chartColors = {
	primary: "var(--primary)",
	border: "var(--border)",
	mutedForeground: "var(--muted-foreground)",
	background: "var(--background)",
	foreground: "var(--foreground)",
	destructive: "var(--destructive)",
	warning: "var(--warning)",
	success: "var(--primary)",
};

export function ExamAnalytics() {
	const params = useParams();
	const examId = params.examId as Id<"exams">;

	const analyticsData = useQuery(api.exams.analytics.getAnalytics, { examId });
	const computeAnalytics = useMutation(
		api.exams.analytics.computeAnalyticsPublic,
	);
	const colors = chartColors;

	const isComputing = analyticsData?.analytics?.status === "computing";
	const isSmallScreen = useAnalyticsBreakpoint();

	const triggerCompute = useCallback(async () => {
		try {
			await computeAnalytics({ examId });
		} catch (error) {
			console.error("Failed to compute analytics", error);
		}
	}, [examId, computeAnalytics]);

	// Auto-trigger computation on first visit when no record exists yet
	useEffect(() => {
		if (
			analyticsData !== undefined &&
			analyticsData.analytics === null &&
			analyticsData.isPublished
		) {
			void triggerCompute();
		}
	}, [analyticsData, triggerCompute]);

	if (!analyticsData) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const stats = analyticsData.analytics;

	const formatTime = (ms?: number) => {
		if (ms === undefined || ms === null) return "N/A";
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		if (minutes === 0) return `${seconds}s`;
		if (seconds === 0) return `${minutes}m`;
		return `${minutes}m ${seconds}s`;
	};

	if (!analyticsData.isPublished) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-xl p-8 text-center">
				<div className="rounded-full bg-background p-4 shadow-sm ring-1 ring-border">
					<EyeOff className="h-8 w-8 text-muted-foreground" />
				</div>
				<div className="max-w-xs space-y-2">
					<h3 className="font-bold text-lg tracking-tight">
						Exam Not Published
					</h3>
					<p className="text-muted-foreground text-sm leading-relaxed">
						This exam is currently in draft mode. Analytics will be available
						once the exam is published and students start submitting their
						responses.
					</p>
				</div>
			</div>
		);
	}

	if (isComputing && (!stats || stats.status === "computing")) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-xl border border-dashed bg-muted/30 p-8 text-center">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
				<div className="space-y-1">
					<h3 className="font-semibold text-lg">Computing Analytics...</h3>
					<p className="max-w-md text-muted-foreground text-sm">
						We are crunching the numbers for your exam. This might take a moment
						if you have a lot of submissions.
					</p>
				</div>
			</div>
		);
	}

	if (!stats) return null;

	if (stats.totalCompletions < 2) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-xl p-8 text-center">
				<div className="rounded-full bg-background p-4 shadow-sm ring-1 ring-border">
					<BarChart2 className="h-8 w-8 text-muted-foreground" />
				</div>
				<div className="max-w-xs space-y-2">
					<h3 className="font-bold text-lg tracking-tight">
						Insufficient Data
					</h3>
					<p className="text-muted-foreground text-sm leading-relaxed">
						We need at least{" "}
						<span className="font-medium text-foreground">2 completions</span>{" "}
						to generate meaningful analytics. Currently, you have{" "}
						<span className="font-medium text-foreground">
							{stats.totalCompletions}
						</span>
						.
					</p>
				</div>
			</div>
		);
	}

	const questionDifficultyData = stats.questionStats.map((q, index) => {
		const total = q.correctCount + q.wrongCount;
		const correctRate = total > 0 ? (q.correctCount / total) * 100 : 0;
		return {
			name: `Q${index + 1}`,
			difficulty: 100 - correctRate,
			correctRate,
			attempts: total,
		};
	});

	if (isSmallScreen) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-xl border border-dashed bg-muted/30 p-8 text-center">
				<div className="rounded-full bg-background p-4 shadow-sm ring-1 ring-border">
					<MonitorOff className="h-8 w-8 text-muted-foreground" />
				</div>
				<div className="max-w-xs space-y-2">
					<h3 className="font-bold text-lg tracking-tight">
						Display Too Small
					</h3>
					<p className="text-muted-foreground text-sm leading-relaxed">
						Analytics are best viewed on a larger screen. Please resize your
						browser window to at least{" "}
						<span className="font-medium text-foreground">530px</span> or use a
						larger device.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl tracking-tight">
						Analytics Overview
					</h2>
					<p className="text-muted-foreground">
						Detailed performance insights for your exam.
					</p>
				</div>
				<Button
					className="gap-2"
					disabled={isComputing}
					onClick={triggerCompute}
					size="sm"
					variant="outline"
				>
					<RefreshCw
						className={`h-4 w-4 ${isComputing ? "animate-spin" : ""}`}
					/>
					{isComputing ? "Recalculating..." : "Refresh Analytics"}
				</Button>
			</div>

			{/* Stat cards */}
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
				<div className="rounded-xl border bg-card p-6 shadow-sm">
					<p className="font-medium text-muted-foreground text-sm">
						Total Completions
					</p>
					<h3 className="mt-2 font-bold text-3xl tabular-nums">
						{stats.totalCompletions}
					</h3>
				</div>

				<div className="rounded-xl border bg-card p-6 shadow-sm">
					<p className="font-medium text-muted-foreground text-sm">
						Avg / Median Score
					</p>
					<div className="mt-2 flex items-baseline gap-1.5">
						<h3 className="font-bold text-3xl tabular-nums">
							{stats.averageScore.toFixed(1)}
						</h3>
						<span className="font-medium text-muted-foreground text-sm tabular-nums">
							/ {stats.medianScore ?? "-"}
						</span>
					</div>
				</div>

				<div className="rounded-xl border bg-card p-6 shadow-sm">
					<p className="font-medium text-muted-foreground text-sm">
						Avg Success Rate
					</p>
					<h3 className="mt-2 font-bold text-3xl tabular-nums">
						{stats.averagePercentage.toFixed(1)}%
					</h3>
				</div>

				<div className="rounded-xl border bg-card p-6 shadow-sm">
					<p className="font-medium text-muted-foreground text-sm">
						Avg / Median Time
					</p>
					<div className="mt-2 flex items-baseline gap-1.5">
						<h3 className="font-bold text-3xl tabular-nums">
							{formatTime(stats.averageCompletionTime)}
						</h3>
						<span className="font-medium text-muted-foreground text-sm">
							/ {formatTime(stats.medianCompletionTime)}
						</span>
					</div>
				</div>

				<div className="rounded-xl border bg-card p-6 shadow-sm">
					<p className="font-medium text-muted-foreground text-sm">
						Last Updated
					</p>
					<div className="mt-2 flex flex-col">
						<h3 className="font-bold text-3xl tabular-nums">
							{isComputing ? (
								<Loader2 className="h-8 w-8 animate-spin text-primary/50" />
							) : (
								new Date(stats.lastUpdated).toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})
							)}
						</h3>
						{!isComputing && (
							<span className="font-medium text-muted-foreground text-sm">
								{new Date(stats.lastUpdated).toLocaleDateString([], {
									month: "short",
									day: "numeric",
								})}
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Charts */}
			<div className="grid gap-8 md:grid-cols-2">
				{/* Score Distribution */}
				<div className="flex min-w-0 flex-col space-y-4">
					<div>
						<h3 className="font-semibold text-lg">Score Distribution</h3>
						<p className="text-muted-foreground text-sm">
							Histogram of student scores.
						</p>
					</div>
					<div className="w-full min-w-0 overflow-hidden">
						<ChartContainer
							config={{
								count: {
									label: "Submissions",
									color: colors.primary,
								},
							}}
						>
							<BarChart
								data={stats.scoreDistribution}
								margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
							>
								<CartesianGrid
									stroke={colors.border}
									strokeDasharray="3 3"
									vertical={false}
								/>
								<XAxis
									axisLine={false}
									dataKey="range"
									tick={{ fontSize: 12, fill: colors.mutedForeground }}
									tickLine={false}
								/>
								<YAxis
									allowDecimals={false}
									axisLine={false}
									tick={{ fontSize: 12, fill: colors.mutedForeground }}
									tickLine={false}
								/>
								<ChartTooltip
									content={<ChartTooltipContent />}
									cursor={{ fill: colors.border, opacity: 0.5 }}
								/>
								<Bar
									dataKey="count"
									fill="var(--color-count)"
									isAnimationActive={false}
									name="Submissions"
									radius={[4, 4, 0, 0]}
								/>
							</BarChart>
						</ChartContainer>
					</div>
				</div>

				{/* Question Success Rate */}
				<div className="flex min-w-0 flex-col space-y-4">
					<div>
						<h3 className="font-semibold text-lg">Question Success Rate</h3>
						<p className="text-muted-foreground text-sm">
							Percentage of correct answers per question.
						</p>
					</div>
					<div className="w-full min-w-0 overflow-hidden">
						<ChartContainer
							config={{
								correctRate: {
									label: "Success Rate",
								},
							}}
						>
							<BarChart
								data={questionDifficultyData}
								margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
							>
								<CartesianGrid
									stroke={colors.border}
									strokeDasharray="3 3"
									vertical={false}
								/>
								<XAxis
									axisLine={false}
									dataKey="name"
									tick={{ fontSize: 12, fill: colors.mutedForeground }}
									tickLine={false}
								/>
								<YAxis
									axisLine={false}
									domain={[0, 100]}
									tick={{ fontSize: 12, fill: colors.mutedForeground }}
									tickLine={false}
									unit="%"
								/>
								<ChartTooltip
									content={
										<ChartTooltipContent
											formatter={(value) => [
												`${Number(value).toFixed(1)}%`,
												" ",
												"Success Rate",
											]}
										/>
									}
									cursor={{ fill: colors.border, opacity: 0.5 }}
								/>
								<Bar
									dataKey="correctRate"
									isAnimationActive={false}
									name="Success Rate"
									radius={[4, 4, 0, 0]}
								>
									{questionDifficultyData.map((entry) => (
										<Cell
											fill={
												entry.correctRate < 50
													? colors.destructive
													: entry.correctRate < 75
														? colors.warning
														: colors.success
											}
											key={`cell-${entry.name}`}
										/>
									))}
								</Bar>
							</BarChart>
						</ChartContainer>
					</div>
				</div>

				{/* Time vs Score Scatter */}
				{(stats.timeVsScore?.length ?? 0) > 0 && (
					<div className="flex min-w-0 flex-col space-y-4">
						<div>
							<h3 className="font-semibold text-lg">Time vs Score</h3>
							<p className="text-muted-foreground text-sm">
								Scatter plot of completion time and score.
							</p>
						</div>
						<div className="w-full min-w-0 overflow-hidden">
							<ChartContainer
								config={{
									score: {
										label: "Score",
										color: colors.primary,
									},
								}}
							>
								<ScatterChart
									margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
								>
									<CartesianGrid stroke={colors.border} strokeDasharray="3 3" />
									<XAxis
										axisLine={false}
										dataKey="timeTaken"
										name="Time"
										tick={{ fontSize: 12, fill: colors.mutedForeground }}
										tickFormatter={formatTime}
										tickLine={false}
										type="number"
									/>
									<YAxis
										axisLine={false}
										dataKey="score"
										name="Score"
										tick={{ fontSize: 12, fill: colors.mutedForeground }}
										tickLine={false}
										type="number"
										unit="%"
									/>
									<ZAxis range={[50, 50]} type="number" />
									<ChartTooltip
										content={
											<ChartTooltipContent
												formatter={(value, name) => {
													const val = Number(value);
													if (name === "Time")
														return [formatTime(val), " ", "Time"];
													return [`${val.toFixed(1)}%`, " ", "Score"];
												}}
											/>
										}
										cursor={{ strokeDasharray: "3 3" }}
									/>
									<Scatter
										data={stats.timeVsScore}
										fill="var(--color-score)"
										isAnimationActive={false}
										name="Students"
									/>
								</ScatterChart>
							</ChartContainer>
						</div>
					</div>
				)}

				{/* Group Comparisons */}
				{(stats.groupStats?.length ?? 0) > 1 && (
					<div className="flex min-w-0 flex-col space-y-4">
						<div>
							<h3 className="font-semibold text-lg">Group Comparisons</h3>
							<p className="text-muted-foreground text-sm">
								Average success rate by class/group.
							</p>
						</div>
						<ChartContainer
							className="w-full"
							config={{
								averagePercentage: {
									label: "Avg Success Rate",
									color: colors.primary,
								},
							}}
						>
							<BarChart
								data={stats.groupStats}
								layout="vertical"
								margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
							>
								<XAxis
									axisLine={false}
									dataKey="averagePercentage"
									domain={[0, 100]}
									tick={{ fontSize: 12, fill: colors.mutedForeground }}
									tickFormatter={(v) => `${v}%`}
									tickLine={false}
									type="number"
								/>
								<YAxis
									axisLine={false}
									dataKey="name"
									tick={{ fontSize: 12, fill: colors.mutedForeground }}
									tickLine={false}
									tickMargin={8}
									type="category"
									width={80}
								/>
								<ChartTooltip
									content={
										<ChartTooltipContent
											formatter={(value) => [
												`${Number(value).toFixed(1)}%`,
												" ",
												"Avg Success Rate",
											]}
										/>
									}
									cursor={false}
								/>
								<Bar
									dataKey="averagePercentage"
									fill="var(--color-averagePercentage)"
									isAnimationActive={false}
									radius={5}
								/>
							</BarChart>
						</ChartContainer>
					</div>
				)}
			</div>

			{/* Item Analysis Table */}
			<div>
				<div className="mb-6">
					<h3 className="font-semibold text-lg">Item Analysis</h3>
					<p className="text-muted-foreground text-sm">
						Detailed breakdown of each question, showing success rates,
						discrimination index, and common distractors.
					</p>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[100px]">Question</TableHead>
							<TableHead>Success Rate</TableHead>
							<TableHead>Skip Rate</TableHead>
							<TableHead>Discrimination</TableHead>
							<TableHead>Distractors</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{stats.questionStats.map((q, index) => {
							const attempts = q.correctCount + q.wrongCount;
							const total = attempts + (q.skipCount ?? 0);
							const successRate =
								total > 0 ? (q.correctCount / total) * 100 : 0;
							const skipRate =
								total > 0 ? ((q.skipCount ?? 0) / total) * 100 : 0;

							let discVariant:
								| "default"
								| "destructive"
								| "warning"
								| "outline"
								| "secondary" = "outline";
							if (q.discriminationIndex !== undefined) {
								if (q.discriminationIndex > 0.3) discVariant = "default";
								else if (q.discriminationIndex > 0.1) discVariant = "warning";
								else discVariant = "destructive";
							}

							return (
								<TableRow key={q.questionId}>
									<TableCell className="font-medium">Q{index + 1}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<div className="relative h-2 w-16 overflow-hidden rounded-full bg-secondary">
												<div
													className="absolute inset-y-0 left-0 bg-primary"
													style={{ width: `${successRate}%` }}
												/>
											</div>
											<span className="text-xs">{successRate.toFixed(0)}%</span>
										</div>
									</TableCell>
									<TableCell>
										{skipRate > 0 ? `${skipRate.toFixed(1)}%` : "-"}
									</TableCell>
									<TableCell>
										{q.discriminationIndex !== undefined ? (
											<Badge variant={discVariant}>
												{q.discriminationIndex > 0 ? "+" : ""}
												{q.discriminationIndex.toFixed(2)}
											</Badge>
										) : (
											<span className="text-muted-foreground text-xs">N/A</span>
										)}
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{q.answerDistribution?.slice(0, 3).map((dist) => (
												<Badge
													className="whitespace-nowrap text-[10px]"
													key={dist.answer}
													variant="secondary"
												>
													<span
														className="max-w-[100px] truncate"
														title={dist.answer}
													>
														{dist.answer || "(Blank)"}
													</span>
													<span className="ml-1 opacity-50">{dist.count}</span>
												</Badge>
											))}
											{(q.answerDistribution?.length ?? 0) > 3 && (
												<span className="flex items-center px-1 text-muted-foreground text-xs">
													+{(q.answerDistribution?.length ?? 0) - 3} more
												</span>
											)}
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
