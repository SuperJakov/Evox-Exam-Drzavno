"use client";

import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

interface SessionItemProps {
	session: {
		_id: string;
		ipAddress: string | null | undefined;
		userAgent: string | null | undefined;
		createdAt: number;
		token: string;
	};
	isCurrent: boolean;
}

export function SessionItem({ session, isCurrent }: SessionItemProps) {
	const revokeSession = useMutation(api.auth.sessions.revokeSession);
	const [isRevoking, setIsRevoking] = useState(false);
	const parser = new UAParser(session.userAgent || "");
	const browser = parser.getBrowser();
	const os = parser.getOS();
	const device = parser.getDevice();

	const handleRevoke = async () => {
		if (isCurrent) return;
		setIsRevoking(true);
		try {
			await revokeSession({ token: session.token });
			toast.success("Session revoked successfully");
		} catch (error) {
			console.error(error);
			toast.error("Failed to revoke session");
		} finally {
			setIsRevoking(false);
		}
	};

	const getIcon = () => {
		if (device.type === "mobile") return <Smartphone className="h-5 w-5" />;
		if (device.type === "tablet") return <Tablet className="h-5 w-5" />;
		return <Monitor className="h-5 w-5" />;
	};

	const vendor = device.vendor;
	const model = device.model;
	const osName = os.name;
	const browserName = browser.name;

	const title =
		vendor && model
			? `${vendor} ${model}`
			: `${browserName || "Unknown Browser"}`;

	const subtitle =
		vendor && model
			? `${browserName} on ${osName}`
			: osName
				? `on ${osName}`
				: "";

	return (
		<div className="flex items-center justify-between p-6">
			<div className="flex items-center gap-4">
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
					{getIcon()}
				</div>
				<div>
					<div className="flex items-center gap-2">
						<p className="font-medium">{title}</p>
						{isCurrent && (
							<Badge className="h-5 px-1.5 text-[10px]" variant="secondary">
								Current
							</Badge>
						)}
					</div>
					<div className="flex flex-col text-muted-foreground text-sm md:flex-row md:items-center md:gap-2">
						{subtitle && (
							<>
								<span>{subtitle}</span>
								<span className="hidden md:inline">•</span>
							</>
						)}
						<span>{session.ipAddress || "Unknown IP"}</span>
						<span className="hidden md:inline">•</span>
						<span>
							Started{" "}
							{formatDistanceToNow(session.createdAt, { addSuffix: true })}
						</span>
					</div>
				</div>
			</div>
			{!isCurrent && (
				<Button
					disabled={isRevoking}
					onClick={handleRevoke}
					size="sm"
					variant="ghost"
				>
					{isRevoking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Revoke"}
				</Button>
			)}
		</div>
	);
}
