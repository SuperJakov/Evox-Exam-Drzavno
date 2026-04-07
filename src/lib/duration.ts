export type DurationParts = {
	hours: string;
	minutes: string;
	seconds: string;
};

export function parseDurationParts({
	hours,
	minutes,
	seconds,
}: DurationParts): number {
	const h = Number.parseInt(hours, 10) || 0;
	const m = Number.parseInt(minutes, 10) || 0;
	const s = Number.parseInt(seconds, 10) || 0;

	return (h * 3600 + m * 60 + s) * 1000;
}

export function getDurationParts(duration: number): DurationParts {
	const totalSeconds = Math.floor(duration / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return {
		hours: hours.toString(),
		minutes: minutes.toString(),
		seconds: seconds.toString(),
	};
}

export function formatDuration(duration: number): string {
	if (duration === 0) {
		return "Unlimited";
	}

	const totalSeconds = Math.floor(duration / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const parts: string[] = [];

	if (hours > 0) parts.push(`${hours}h`);
	if (minutes > 0) parts.push(`${minutes}m`);
	if (seconds > 0) parts.push(`${seconds}s`);

	return parts.join(" ");
}
