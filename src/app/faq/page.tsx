import type { Metadata } from "next";
import Link from "next/link";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "~/components/ui/accordion";

export const metadata: Metadata = {
	title: "FAQ",
	description: "Frequently asked questions about Evox Exam platform.",
	keywords: ["faq", "frequently asked questions", "help", "evox exam"],
};

const faqGroups = [
	{
		title: "General",
		items: [
			{
				id: "what-is-evox-exam",
				question: "What is Evox Exam?",
				answer:
					"Evox Exam is a comprehensive platform designed to streamline the process of creating, managing, and taking exams. Whether you're an educator looking to test students or an organization assessing employee skills, Evox Exam provides the tools you need.",
			},
			{
				id: "is-it-free-to-use",
				question: "Is it free to use?",
				answer: "We are currently completely free to use.",
			},
			{
				id: "how-reliable-is-evox-exam",
				question: "How reliable is Evox Exam?",
				answer:
					"Evox Exam was tested with up to 1000 concurrent users. We use the best cloud providers to ensure maximum reliability.",
			},
			{
				id: "which-devices-are-supported",
				question: "Which devices are supported?",
				answer:
					"Evox Exam works on any web browser, including desktops, laptops, tablets, and smartphones. For the best experience during an exam, a desktop or laptop is recommended.",
			},
			{
				id: "do-i-need-to-install-anything",
				question: "Do I need to install anything?",
				answer:
					"No installation is required. Evox Exam is entirely web-based and runs directly in your browser.",
			},
		],
	},
	{
		title: "For Educators",
		items: [
			{
				id: "how-do-i-create-an-exam",
				question: "How do I create an exam?",
				answer:
					'To create an exam, simply sign up for an account, navigate to your dashboard, and click on the "Create Exam" button. You can then add various types of questions, set time limits, and configure sharing settings.',
			},
			{
				id: "how-do-i-render-math",
				question: "How do I render math expressions?",
				answer: (
					<>
						Evox Exam supports LaTeX for rendering math. You can use delimiters
						like \( ... \), $$ ... $$, or \[ ... \] to include math in your
						questions and answers. For more information and examples, see our{" "}
						<Link className="text-primary underline" href="/latex-guide">
							LaTeX Guide
						</Link>
						.
					</>
				),
			},
			{
				id: "what-question-types-supported",
				question: "What question types are supported?",
				answer:
					"We support multiple choice, multiple response, and true/false questions. We are constantly evaluating new question types based on educator feedback.",
			},
			{
				id: "can-i-schedule-in-advance",
				question: "Can I schedule an exam in advance?",
				answer:
					"Yes, you can configure your exam with a specific opening and closing date and time. Students will only be able to join during that window.",
			},
			{
				id: "can-i-export-results",
				question: "Can I export results?",
				answer:
					"Yes, you can export exam results in various formats including CSV and PDF, making it easy to integrate with your existing grading systems or records.",
			},
			{
				id: "can-i-edit-exam-after-publish",
				question: "Can I edit an exam after it has been published?",
				answer:
					"To maintain the correctness of results, certain parts of an exam cannot be modified while it is published. You can only change which answer is correct and how much points each question gives after publish. Once you do that, all submissions will be regraded.",
			},
			{
				id: "how-does-shuffling-work",
				question: 'How does the "Shuffling" feature work?',
				answer:
					"You can enable shuffling for both questions and the answers for an exam. We use a smart randomizer, which ensures that each student gets a unique version of the exam while keeping the results consistent for your review.",
			},
		],
	},
	{
		title: "For Students",
		items: [
			{
				id: "how-do-students-access-exam",
				question: "How do students access exams?",
				answer:
					"Students can join an exam by entering a unique 6-digit access code on the join page. This code is generated in the teacher's dashboard for each exam and is time-limited to ensure security and prevent unauthorized access.",
			},
			{
				id: "can-i-review-my-answers",
				question: "Can I review my answers before submitting?",
				answer:
					"Yes, as long as time permits, you can navigate back and forth between questions using the exam navigation menu to review and modify your answers before your final submission.",
			},
			{
				id: "how-do-i-know-time-left",
				question: "How do I know how much time is left?",
				answer:
					"There is a persistent timer clearly displayed on the screen during your exam that counts down your remaining time.",
			},
			{
				id: "what-happens-internet-lost",
				question: "What happens if my internet disconnects during an exam?",
				answer:
					"Evox Exam periodically saves your progress. If you lose connection, try to reconnect and refresh the page as soon as possible to resume where you left off.",
			},
			{
				id: "will-i-see-my-score",
				question: "Will I see my score immediately?",
				answer:
					"This depends on the settings configured by your educator. Some exams reveal scores instantly upon submission, while others may be hidden until the educator decides to release them.",
			},
		],
	},
	{
		title: "Security & Account",
		items: [
			{
				id: "how-secure-is-the-platform",
				question: "How secure is the platform?",
				answer:
					"Security is our top priority. We use industry-standard encryption for data transmission and storage. We also offer features like randomized question order and we track tab-switching to minimize cheating.",
			},
			{
				id: "is-my-data-shared",
				question: "Is my data shared with third parties?",
				answer:
					"No, we respect your privacy. Your personal information and exam data are never sold or shared with unauthorized third parties.",
			},
			{
				id: "how-does-tab-switch-detection-work",
				question: "How does tab-switch tracking work?",
				answer:
					"To ensure fairness, the platform detects when a student switches to another tab or window during an active exam. These events are logged and reported to the teacher in the exam results.",
			},
			{
				id: "what-if-i-lose-my-password",
				question: "What if I lose my password?",
				answer:
					"You can reset your password by clicking on the 'Recover Password' link on the login page. If you are logged in, you can reset it in the settings page. You will need access to your e-mail address.",
			},
			{
				id: "can-multiple-educators-manage",
				question: "Can multiple educators manage the same exam?",
				answer:
					"Currently, exams are securely tied to a single educator account. We are exploring team collaboration features for future updates.",
			},
			{
				id: "how-do-i-delete-my-account",
				question: "How do I delete my account?",
				answer:
					"You can request account deletion in your profile settings. For security, we'll send a confirmation email to your registered address to verify the request before any data is permanently removed. The account will be deleted permamently instantly after confirmation.",
			},
		],
	},
];

export default function FAQPage() {
	return (
		<div className="container mx-auto max-w-3xl px-4 py-16">
			<div className="mb-12 text-center">
				<h1 className="mb-4 font-extrabold text-4xl tracking-tight">
					Frequently Asked Questions
				</h1>
				<p className="text-lg text-muted-foreground">
					Find answers to common questions about Evox Exam.
				</p>
			</div>

			<div className="space-y-12">
				{faqGroups.map((group) => (
					<section key={group.title}>
						<h2 className="mb-6 font-bold text-2xl tracking-tight">
							{group.title}
						</h2>
						<Accordion className="w-full" collapsible type="single">
							{group.items.map((faq) => (
								<AccordionItem key={faq.id} value={faq.id}>
									<AccordionTrigger className="text-left font-medium text-lg">
										{faq.question}
									</AccordionTrigger>
									<AccordionContent className="text-muted-foreground leading-relaxed">
										{faq.answer}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</section>
				))}
			</div>
		</div>
	);
}
