import { useAtom } from "jotai";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
	examShuffleAnswersAtom,
	examShuffleQuestionsAtom,
	examTitleAtom,
} from "../atoms";
import DurationInputs from "./duration-inputs";

interface ExamFormFieldsProps {
	onSubmit: (e: React.FormEvent) => void;
	isSubmitting: boolean;
	error: string;
}

export default function ExamFormFields({
	onSubmit,
	isSubmitting,
	error,
}: ExamFormFieldsProps) {
	const [title, setTitle] = useAtom(examTitleAtom);
	const [shuffleQuestions, setShuffleQuestions] = useAtom(
		examShuffleQuestionsAtom,
	);
	const [shuffleAnswers, setShuffleAnswers] = useAtom(examShuffleAnswersAtom);

	return (
		<form className="space-y-6" onSubmit={onSubmit}>
			<div className="space-y-2">
				<Label htmlFor="title">Exam Title</Label>
				<Input
					id="title"
					onChange={(e) => setTitle(e.target.value)}
					placeholder="e.g., Introduction to Physics"
					required
					value={title}
				/>
			</div>

			<DurationInputs />

			<div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
				<div className="space-y-0.5">
					<Label className="cursor-pointer text-base" htmlFor="shuffle">
						Shuffle Questions
					</Label>
					<p className="text-muted-foreground text-sm">
						Each participant will see questions in a different random order.
					</p>
				</div>
				<Switch
					checked={shuffleQuestions}
					disabled={isSubmitting}
					id="shuffle"
					onCheckedChange={(checked: boolean) => setShuffleQuestions(checked)}
				/>
			</div>

			<div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
				<div className="space-y-0.5">
					<Label className="cursor-pointer text-base" htmlFor="shuffle-answers">
						Shuffle Answers
					</Label>
					<p className="text-muted-foreground text-sm">
						Multiple choice options will be randomized for each participant.
					</p>
				</div>
				<Switch
					checked={shuffleAnswers}
					disabled={isSubmitting}
					id="shuffle-answers"
					onCheckedChange={(checked: boolean) => setShuffleAnswers(checked)}
				/>
			</div>

			<div className="flex flex-col items-end gap-2">
				{error && (
					<p className="w-full text-center text-destructive text-sm">{error}</p>
				)}
				<Button disabled={isSubmitting} type="submit">
					{isSubmitting ? "Creating..." : "Create Exam"}
				</Button>
			</div>
		</form>
	);
}
