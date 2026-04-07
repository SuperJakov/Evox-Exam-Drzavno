"use client";

import { Clock } from "lucide-react";

export function HistorySection() {
	return (
		<div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-muted border-dashed">
			<div className="space-y-2 text-center">
				<Clock className="mx-auto h-10 w-10 text-muted-foreground" />
				<p className="text-muted-foreground">Billing history coming soon.</p>
			</div>
		</div>
	);
}
