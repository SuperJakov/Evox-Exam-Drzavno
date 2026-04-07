"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import { isActivateDialogOpenAtom } from "../shared/atoms";

const presets = [
	{ label: "1 Hour", value: 60 * 60 * 1000 },
	{ label: "3 Hours", value: 3 * 60 * 60 * 1000 },
	{ label: "6 Hours", value: 6 * 60 * 60 * 1000 },
	{ label: "12 Hours", value: 12 * 60 * 60 * 1000 },
];

export function ActivateCodeDialog() {
	const params = useParams<{ examId: Id<"exams"> }>();
	const exam = useAuthedConvexQuery(api.exams.general.getExamDetails, {
		examId: params.examId,
	});
	const groupings = useAuthedConvexQuery(
		api.exams.submission.host.getExamGroupings,
		{
			examId: params.examId,
		},
	);
	const [isOpen, setIsOpen] = useAtom(isActivateDialogOpenAtom);
	const activateAccessCode = useMutation(api.exams.access.activateAccessCode);
	const [isActivating, setIsActivating] = useState(false);
	const [activationError, setActivationError] = useState("");
	const [activateHours, setActivateHours] = useState("1");
	const [activateMinutes, setActivateMinutes] = useState("0");
	const [activateSeconds, setActivateSeconds] = useState("0");
	const [selectedGroupingId, setSelectedGroupingId] = useState<
		Id<"examGroupings"> | "none"
	>("none");
	const [newGroupName, setNewGroupName] = useState("");
	const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

	if (!exam) {
		return null;
	}

	const handlePresetClick = (value: number) => {
		setSelectedPreset(selectedPreset === value ? null : value);
	};

	const handleActivate = async (durationMs: number) => {
		setIsActivating(true);
		setActivationError("");
		try {
			await activateAccessCode({
				examId: exam._id,
				durationMs,
				groupingId:
					selectedGroupingId !== "none" ? selectedGroupingId : undefined,
				newGroupName:
					selectedGroupingId === "none" && newGroupName.trim()
						? newGroupName.trim()
						: undefined,
			});
			setIsOpen(false);
			setNewGroupName("");
			setSelectedGroupingId("none");
			setSelectedPreset(null);
		} catch (error) {
			console.error("Failed to activate code:", error);
			if (error instanceof Error) {
				setActivationError(error.message);
			} else {
				setActivationError("An unexpected error occurred");
			}
		} finally {
			setIsActivating(false);
		}
	};

	const handleCustomActivate = () => {
		const h = parseInt(activateHours, 10) || 0;
		const m = parseInt(activateMinutes, 10) || 0;
		const s = parseInt(activateSeconds, 10) || 0;
		const durationMs = (h * 3600 + m * 60 + s) * 1000;
		handleActivate(durationMs);
	};

	const handleSubmit = () => {
		if (selectedPreset !== null) {
			handleActivate(selectedPreset);
		} else {
			handleCustomActivate();
		}
	};

	const getDisplayTime = () => {
		// 1. Calculate total seconds based on state
		const totalSeconds =
			selectedPreset !== null
				? selectedPreset / 1000
				: (parseInt(activateHours, 10) || 0) * 3600 +
					(parseInt(activateMinutes, 10) || 0) * 60 +
					(parseInt(activateSeconds, 10) || 0);

		if (totalSeconds <= 0) return "0 minutes";

		// 2. Extract time units using remainders
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);

		// 3. Helper for pluralization
		const formatUnit = (value: number, unit: string) =>
			`${value} ${unit}${value === 1 ? "" : "s"}`;

		// 4. Build the output array
		const parts = [];
		if (hours > 0) parts.push(formatUnit(hours, "hour"));
		if (minutes > 0) parts.push(formatUnit(minutes, "minute"));

		return parts.length > 0 ? parts.join(" and ") : "0 minutes";
	};
	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Activate Access Code</DialogTitle>
					<DialogDescription>
						Choose how long the access code should remain active.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="flex flex-col gap-2">
						<Label className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
							Quick Presets
						</Label>
						<div className="grid grid-cols-2 gap-2">
							{presets.map((preset) => (
								<Button
									disabled={isActivating}
									key={preset.value}
									onClick={() => handlePresetClick(preset.value)}
									size="sm"
									variant={
										selectedPreset === preset.value ? "default" : "outline"
									}
								>
									{preset.label}
								</Button>
							))}
						</div>
					</div>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or custom duration
							</span>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex gap-4">
							<div className="flex-1 space-y-1">
								<Label
									className={`text-xs ${selectedPreset !== null ? "text-muted-foreground/50" : "text-muted-foreground"}`}
									htmlFor="activate-hours"
								>
									Hours
								</Label>
								<Input
									disabled={selectedPreset !== null || isActivating}
									id="activate-hours"
									max="12"
									min="0"
									onChange={(e) => {
										if (parseInt(e.target.value, 10) > 12) return;
										if (parseInt(e.target.value, 10) < 0) return;
										setActivateHours(e.target.value);
									}}
									placeholder="1"
									type="number"
									value={activateHours}
								/>
							</div>
							<div className="flex-1 space-y-1">
								<Label
									className={`text-xs ${selectedPreset !== null ? "text-muted-foreground/50" : "text-muted-foreground"}`}
									htmlFor="activate-minutes"
								>
									Minutes
								</Label>
								<Input
									disabled={selectedPreset !== null || isActivating}
									id="activate-minutes"
									max="59"
									min="0"
									onChange={(e) => {
										if (parseInt(e.target.value, 10) > 59) return;
										if (parseInt(e.target.value, 10) < 0) return;
										setActivateMinutes(e.target.value);
									}}
									placeholder="0"
									type="number"
									value={activateMinutes}
								/>
							</div>
							<div className="flex-1 space-y-1">
								<Label
									className={`text-xs ${selectedPreset !== null ? "text-muted-foreground/50" : "text-muted-foreground"}`}
									htmlFor="activate-seconds"
								>
									Seconds
								</Label>
								<Input
									disabled={selectedPreset !== null || isActivating}
									id="activate-seconds"
									max="59"
									min="0"
									onChange={(e) => {
										if (parseInt(e.target.value, 10) > 59) return;
										if (parseInt(e.target.value, 10) < 0) return;
										setActivateSeconds(e.target.value);
									}}
									placeholder="0"
									type="number"
									value={activateSeconds}
								/>
							</div>
						</div>

						<div className="space-y-4 rounded-md border p-3">
							<Label className="font-semibold text-xs uppercase tracking-wider">
								Grouping Configuration
							</Label>
							<div className="space-y-1">
								<Label
									className="text-muted-foreground text-xs"
									htmlFor="activate-existing"
								>
									Select Existing Group:
								</Label>
								<Select
									onValueChange={(val) => {
										setSelectedGroupingId(val as Id<"examGroupings"> | "none");
										if (val !== "none") setNewGroupName("");
									}}
									value={selectedGroupingId}
								>
									<SelectTrigger id="activate-existing">
										<SelectValue placeholder="No group" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">Ungrouped / New Group</SelectItem>
										{groupings?.map((group) => (
											<SelectItem key={group._id} value={group._id}>
												{group.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1">
								<Label
									className={`text-xs ${selectedGroupingId !== "none" ? "text-muted-foreground/50" : "text-muted-foreground"}`}
									htmlFor="activate-grouping"
								>
									Or Create New Group:
								</Label>
								<Input
									disabled={selectedGroupingId !== "none"}
									id="activate-grouping"
									onChange={(e) => setNewGroupName(e.target.value)}
									placeholder='e.g. "Grade 10", "Section A"'
									type="text"
									value={newGroupName}
								/>
							</div>
						</div>

						<Button
							className="w-full"
							disabled={isActivating}
							onClick={handleSubmit}
						>
							{isActivating && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Activate Access Code for {getDisplayTime()}
						</Button>

						<p className="text-center text-[10px] text-muted-foreground">
							Min: 5m | Max: 12h
						</p>
					</div>

					{activationError && (
						<p className="text-center text-destructive text-sm">
							{activationError}
						</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
