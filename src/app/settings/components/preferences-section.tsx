"use client";

import { Settings2 } from "lucide-react";

export function PreferencesSection() {
	return (
		<div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-muted border-dashed">
			<div className="space-y-2 text-center">
				<Settings2 className="mx-auto h-10 w-10 text-muted-foreground" />
				<p className="text-muted-foreground">
					Preferences settings coming soon.
				</p>
			</div>
		</div>
	);
}
