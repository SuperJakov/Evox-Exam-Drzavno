"use client";

import { useAtom } from "jotai";
import { useParams } from "next/navigation";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { activeTabAtomFamily, isActivateDialogOpenAtom } from "../shared/atoms";
import { SidebarHeader } from "./sidebar-header";

interface SidebarProps {
	tabs: {
		value: string;
		label: string;
		icon: React.ElementType;
		content?: React.ReactNode;
		className?: string;
	}[];
	isPublished: boolean;
	hasActiveCode: boolean;
}

export function Sidebar({ tabs, isPublished, hasActiveCode }: SidebarProps) {
	const params = useParams();
	const examId = params.examId as string;
	const [activeTab, setActiveTab] = useAtom(activeTabAtomFamily(examId));
	const [, setIsActivateDialogOpen] = useAtom(isActivateDialogOpenAtom);

	const renderActionButton = () => (
		<Button
			className="w-full font-semibold text-sm"
			onClick={() => {
				setActiveTab("settings");
				if (isPublished && !hasActiveCode) {
					setIsActivateDialogOpen(true);
				}
			}}
			size="lg"
			variant={hasActiveCode ? "secondary" : "default"}
		>
			{!isPublished
				? "Publish Exam"
				: hasActiveCode
					? "Manage Access Code"
					: "Activate Access Code"}
		</Button>
	);

	return (
		<aside className="z-10 flex w-full shrink-0 flex-col border-b bg-background md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:w-64 md:border-r md:border-b-0 lg:w-[19rem]">
			<div className="scrollbar-hide flex flex-1 flex-col gap-4 p-4 md:gap-8 md:overflow-y-auto md:p-6 lg:p-8">
				<div className="flex flex-col gap-4">
					<SidebarHeader />
					<div className="md:hidden">{renderActionButton()}</div>
				</div>

				<nav className="flex flex-wrap gap-2 md:flex-col">
					{tabs.map((tab) => {
						const isActive = activeTab === tab.value;
						return (
							<Button
								className={cn(
									"shrink-0 justify-start gap-2 md:w-full md:shrink md:gap-3",
									!isActive && "text-muted-foreground",
								)}
								key={tab.value}
								onClick={() => setActiveTab(tab.value)}
								variant={isActive ? "default" : "ghost"}
							>
								<tab.icon className="h-4 w-4 shrink-0" />
								<span className="truncate">
									<span className="md:hidden">
										{tab.label === "Exam Settings" ? "Settings" : tab.label}
									</span>
									<span className="hidden md:inline">{tab.label}</span>
								</span>
							</Button>
						);
					})}
				</nav>
			</div>

			<div className="mt-auto hidden border-t bg-background p-4 md:block md:p-6 lg:p-8">
				{renderActionButton()}
			</div>
		</aside>
	);
}
