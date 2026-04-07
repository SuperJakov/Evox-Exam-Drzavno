import { useAtom } from "jotai";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { examHoursAtom, examMinutesAtom, examSecondsAtom } from "../atoms";

export default function DurationInputs() {
	const [hours, setHours] = useAtom(examHoursAtom);
	const [minutes, setMinutes] = useAtom(examMinutesAtom);
	const [seconds, setSeconds] = useAtom(examSecondsAtom);

	return (
		<div className="space-y-2">
			<Label>Duration</Label>
			<div className="flex gap-4">
				<div className="flex-1 space-y-1">
					<Label className="text-muted-foreground text-xs" htmlFor="hours">
						Hours
					</Label>
					<Input
						id="hours"
						min="0"
						onChange={(e) => setHours(e.target.value)}
						placeholder="1"
						type="number"
						value={hours}
					/>
				</div>
				<div className="flex-1 space-y-1">
					<Label className="text-muted-foreground text-xs" htmlFor="minutes">
						Minutes
					</Label>
					<Input
						id="minutes"
						max="59"
						min="0"
						onChange={(e) => setMinutes(e.target.value)}
						placeholder="0"
						type="number"
						value={minutes}
					/>
				</div>
				<div className="flex-1 space-y-1">
					<Label className="text-muted-foreground text-xs" htmlFor="seconds">
						Seconds
					</Label>
					<Input
						id="seconds"
						max="59"
						min="0"
						onChange={(e) => setSeconds(e.target.value)}
						placeholder="0"
						type="number"
						value={seconds}
					/>
				</div>
			</div>
		</div>
	);
}
