import { AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface ExamFooterProps {
	isOnline: boolean;
	isSubmitting: boolean;
	onFinish: () => void;
}

export function ExamFooter({
	isOnline,
	isSubmitting,
	onFinish,
}: ExamFooterProps) {
	return (
		<div className="fixed right-0 bottom-0 left-0 flex justify-center border-t bg-background p-4">
			<div className="flex w-full max-w-3xl items-center justify-between">
				<p
					className={cn(
						"flex items-center text-sm transition-colors duration-500",
						isOnline ? "text-muted-foreground" : "text-destructive",
					)}
				>
					<AlertCircle
						className={cn(
							"mr-2 h-4 w-4",
							!isOnline && "animate-bounce duration-1000",
						)}
					/>
					{isOnline
						? "Answers are saved automatically."
						: "No internet connection"}
				</p>
				<Button
					disabled={isSubmitting || !isOnline}
					onClick={onFinish}
					size="lg"
				>
					{isSubmitting ? "Submitting..." : "Submit Exam"}
				</Button>
			</div>
		</div>
	);
}
