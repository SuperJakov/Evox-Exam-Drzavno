import {
	BarChart3,
	CheckCircle2,
	Clock,
	GraduationCap,
	Lock,
	Shield,
	Timer,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeAuthButton } from "~/components/home-auth-button";
import { LazyExamGradingAnimation } from "~/components/lazy-exam-grading-animation";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
	title: "Evox Exam | Secure and Easy Online Exams",
	description:
		"Evox Exam is a modern, secure platform for professors to create, host, and grade exams with confidence. Features include anti-cheating measures, instant analytics, and auto-grading.",
	keywords: [
		"Evox Exam",
		"exam platform",
		"online testing",
		"academic integrity",
		"anti-cheating",
		"grading software",
		"education technology",
	],
	alternates: {
		canonical: "https://www.evoxexam.xyz",
	},
};

export default function Home() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<main className="flex flex-col items-center">
				{/* Hero Section */}
				<section className="w-full py-16 md:py-24 lg:py-32">
					<div className="container mx-auto px-4">
						<div className="flex flex-col items-center gap-12 lg:flex-row lg:justify-center lg:gap-20">
							{/* Text Content */}
							<div className="max-w-xl text-center lg:text-left">
								<p className="mb-4 font-medium text-primary text-sm uppercase tracking-wide">
									For Professors & Institutions
								</p>
								<h1 className="font-bold text-4xl tracking-tight sm:text-5xl">
									Create, Host, and Grade Exams with Confidence
								</h1>
								<p className="mt-6 text-lg text-muted-foreground">
									A modern exam platform built for academic integrity. Set up in
									minutes, not hours. Monitor in real-time. Grade instantly.
								</p>
								<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
									<Link href="/join">
										<Button className="h-12 px-8 text-lg" size="lg">
											Join an Exam
										</Button>
									</Link>
									<HomeAuthButton />
								</div>
							</div>

							{/* Animation */}
							<div className="shrink-0">
								<LazyExamGradingAnimation />
							</div>
						</div>
					</div>
				</section>

				{/* Why Evox Section */}
				<section className="w-full border-y py-20">
					<div className="container mx-auto px-4">
						<div className="mb-16 text-center">
							<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
								Why Professors Choose Evox Exam
							</h2>
							<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
								Focus on teaching, not administration. Our platform handles the
								technical details so you can focus on what matters.
							</p>
						</div>

						{/* Grid layout - 3 cols on lg, 2 on md, 1 on mobile */}
						<div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
							{/* Quick Setup */}
							<div className="flex flex-col items-center text-center">
								<Timer
									className="mb-5 h-12 w-12 text-primary"
									strokeWidth={1.5}
								/>
								<p className="text-muted-foreground">
									<span className="font-semibold text-foreground">
										Quick Setup.
									</span>{" "}
									Create an exam in under 5 minutes. Add questions, set time
									limits, and share a code.
								</p>
							</div>

							{/* Anti-Cheating */}
							<div className="flex flex-col items-center text-center">
								<Shield
									className="mb-5 h-12 w-12 text-primary"
									strokeWidth={1.5}
								/>
								<p className="text-muted-foreground">
									<span className="font-semibold text-foreground">
										Prevent cheating
									</span>{" "}
									with full-screen lockdown, tab-switch detection, and activity
									logging.
								</p>
							</div>

							{/* Instant Analytics */}
							<div className="flex flex-col items-center text-center">
								<BarChart3
									className="mb-5 h-12 w-12 text-primary"
									strokeWidth={1.5}
								/>
								<p className="text-muted-foreground">
									<span className="font-semibold text-foreground">
										Instant Analytics.
									</span>{" "}
									See how students performed at a glance. Identify problem areas
									and track progress.
								</p>
							</div>

							{/* Automatic Grading */}
							<div className="flex flex-col items-center text-center">
								<CheckCircle2
									className="mb-5 h-12 w-12 text-primary"
									strokeWidth={1.5}
								/>
								<p className="text-muted-foreground">
									<span className="font-semibold text-foreground">
										Auto-grade your exams
									</span>{" "}
									instantly for multiple choice and true/false. Manual override
									always available.
								</p>
							</div>

							{/* Flexible Timing */}
							<div className="flex flex-col items-center text-center">
								<Clock
									className="mb-5 h-12 w-12 text-primary"
									strokeWidth={1.5}
								/>
								<p className="text-muted-foreground">
									<span className="font-semibold text-foreground">
										Flexible Timing.
									</span>{" "}
									Set per-exam time limits. Auto-submit when time runs out.
									Extend time if needed.
								</p>
							</div>

							{/* Secure Access */}
							<div className="flex flex-col items-center text-center">
								<Lock
									className="mb-5 h-12 w-12 text-primary"
									strokeWidth={1.5}
								/>
								<p className="text-muted-foreground">
									<span className="font-semibold text-foreground">
										Secure Access.
									</span>{" "}
									Generate temporary access codes with expiration times. Control
									when students can enter.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* How it Works Section */}
				<section className="w-full py-20">
					<div className="container mx-auto px-4">
						<div className="mb-12 text-center">
							<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
								How It Works
							</h2>
							<p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
								Get started in three simple steps.
							</p>
						</div>

						<div className="grid gap-8 md:grid-cols-3">
							<div className="text-center">
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
									1
								</div>
								<h3 className="mb-2 font-semibold text-xl">Create Your Exam</h3>
								<p className="text-muted-foreground">
									Add questions with our editor. Support for multiple choice,
									true/false, and open-ended questions.
								</p>
							</div>

							<div className="text-center">
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
									2
								</div>
								<h3 className="mb-2 font-semibold text-xl">Share the Code</h3>
								<p className="text-muted-foreground">
									Generate a 6-digit access code and share it with your
									students. Set when the code becomes active.
								</p>
							</div>

							<div className="text-center">
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-lg text-primary-foreground">
									3
								</div>
								<h3 className="mb-2 font-semibold text-xl">
									Review Submissions
								</h3>
								<p className="text-muted-foreground">
									Watch progress in real-time. View results instantly after
									students submit. Export grades when ready.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Features List Section */}
				<section className="w-full border-t py-16">
					<div className="container mx-auto px-4">
						<div className="mb-8 text-center">
							<h3 className="font-semibold text-muted-foreground">
								Everything you need for academic assessments
							</h3>
						</div>
						<div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-muted-foreground">
							{[
								"Question Shuffling",
								"Answer Shuffling",
								"PDF Reports",
								"Multiple Question Types",
								"Partial Grading",
								"Student Feedback",
								"Real-time Monitoring",
								"Cheating Detection",
							].map((feature) => (
								<div className="flex items-center gap-2" key={feature}>
									<CheckCircle2 className="h-4 w-4 text-primary" />
									<span className="text-sm">{feature}</span>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="w-full border-t py-20">
					<div className="container mx-auto px-4 text-center">
						<GraduationCap className="mx-auto mb-4 h-12 w-12 text-primary" />
						<h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
							Ready to Get Started?
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-muted-foreground">
							Create your free account and host your first exam today. No credit
							card required.
						</p>
						<div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link href="/sign-up">
								<Button className="h-12 px-8 text-lg" size="lg">
									Create Free Account
								</Button>
							</Link>
							<Link href="/join">
								<Button
									className="h-12 px-8 text-lg"
									size="lg"
									variant="outline"
								>
									I Have an Access Code
								</Button>
							</Link>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="w-full border-t py-8">
					<div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
						<div className="flex items-center gap-2">
							<Image
								alt="Evox Exam Logo"
								height={24}
								src="/logo.png"
								width={24}
							/>
							<span className="font-semibold">Evox Exam</span>
						</div>
						<p className="text-muted-foreground text-sm">
							© {new Date().getFullYear()} Evox Exam. All rights reserved.
						</p>
						<div className="flex gap-6 text-muted-foreground text-sm">
							<Link className="hover:text-foreground" href="/privacy">
								Privacy
							</Link>
							<Link className="hover:text-foreground" href="/terms">
								Terms
							</Link>
						</div>
					</div>
				</footer>
			</main>
		</div>
	);
}
