import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface ExamCompletedProps {
	score?: number;
	totalPoints: number;
}

export function ExamCompleted({ score, totalPoints }: ExamCompletedProps) {
	return (
		<div className="container mx-auto max-w-2xl space-y-6 py-20 text-center">
			<div className="flex justify-center">
				<CheckCircle className="h-20 w-20 text-primary" />
			</div>
			<h1 className="font-bold text-3xl">Exam Completed!</h1>
			<p className="text-lg text-muted-foreground">
				You have successfully submitted your exam.
			</p>
			{score !== undefined && (
				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Your Score</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="font-bold text-4xl text-primary">
							{score}/{totalPoints}
						</p>
					</CardContent>
				</Card>
			)}
			<Button asChild className="mt-8">
				<Link href="/">Return to Home</Link>
			</Button>
		</div>
	);
}
