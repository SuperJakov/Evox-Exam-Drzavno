import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Terms of Service",
	description:
		"Terms of Service for Evox Exam platform. Read our rules and guidelines.",
	keywords: ["terms of service", "legal", "rules", "evox exam"],
	alternates: {
		canonical: "https://www.evoxexam.xyz/terms",
	},
};

export default function TermsPage() {
	// Static date to avoid hydration mismatch
	const effectiveDate = "January 10, 2026";

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<div className="mb-10 text-center">
				<h1 className="font-extrabold text-4xl text-foreground tracking-tight">
					Terms of Service
				</h1>
				<p className="mt-2 text-muted-foreground">
					Effective Date: {effectiveDate}
				</p>
			</div>

			<div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						1. Acceptance of Terms
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						By accessing or using the Evox Exam platform ("Service"), you agree
						to be bound by these Terms of Service ("Terms"). If you do not agree
						to these terms, please do not access or use our services.
					</p>
					<p className="mt-2 text-muted-foreground leading-relaxed">
						If you are a consumer based in the European Union, you benefit from
						any mandatory provisions of the law of the country in which you are
						resident. Nothing in these Terms, including the Governing Law
						clause, affects your rights as a consumer to rely on such mandatory
						provisions of local law.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						2. Academic Integrity & Conduct
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						Evox Exam is a platform dedicated to fair assessment. Our rules
						strictly prohibit:
					</p>
					<ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
						<li>
							Cheating, plagiarism, or aiding others in academic dishonesty.
						</li>
						<li>Using unauthorized automated tools, bots, or scripts.</li>
						<li>
							Sharing credentials to allow another individual to take an exam on
							your behalf.
						</li>
					</ul>
					<p className="mt-4 text-muted-foreground leading-relaxed">
						To enforce these rules, we may monitor and track your real-time
						online presence, window focus, tab switches, and fullscreen mode
						usage during an exam. These events are logged and reported to the
						exam administrator.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						3. User Accounts & Security
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						You are responsible for safeguarding your account credentials. You
						agree to notify us immediately upon becoming aware of any breach of
						security or unauthorized use of your account.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						4. Right of Withdrawal (EU Consumers)
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						If you are an EU consumer, you generally have a right to withdraw
						from a contract for digital services within 14 days. However, by
						starting an exam or accessing digital content on Evox Exam, you
						expressly acknowledge that the performance of the service has begun
						and <strong>you thereby lose your right of withdrawal</strong> once
						access has been granted.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						5. Termination
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						We may terminate or suspend your account for breach of these Terms.
						If you are a paid user, we will provide reasonable notice prior to
						termination unless the termination is due to a serious breach (such
						as academic dishonesty or hacking) or legal requirement.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						6. Limitation of Liability
					</h2>
					<div className="space-y-4 text-muted-foreground leading-relaxed">
						<p>
							<strong>For Users outside the EU:</strong>
							<br />
							TO THE MAX EXTENT PERMITTED BY LAW, EVOX EXAM SHALL NOT BE LIABLE
							FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.
						</p>
						<p>
							<strong>For EU Consumers:</strong>
							<br />
							Nothing in these Terms excludes or limits our liability for: 1.
							Death or personal injury caused by our negligence; 2. Fraud or
							fraudulent misrepresentation; 3. Any other liability which cannot
							be excluded or limited by applicable law.
						</p>
						<p>
							Subject to the above, Evox Exam is responsible for loss or damage
							you suffer that is a foreseeable result of our breaking this
							contract or our failing to use reasonable care and skill. We are
							not responsible for any loss or damage that is not foreseeable.
						</p>
					</div>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						7. Disclaimer
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We
						do not warrant that the Service will be uninterrupted or error-free.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						8. Governing Law
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						These Terms shall be governed by the laws of{" "}
						<strong>Croatia</strong>. However, if you are a consumer resident in
						the European Union, you will benefit from any mandatory provisions
						of the law of the country in which you are resident.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						9. Changes to Terms
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						We reserve the right to modify these Terms at any time.
					</p>
					<ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
						<li>
							<strong>Minor Changes:</strong> For minor changes (e.g., typos,
							formatting), we will update the "Effective Date" at the top of
							this page.
						</li>
						<li>
							<strong>Material Changes:</strong> For significant changes that
							affect your rights or obligations, we will provide at least{" "}
							<strong>30 days' notice</strong> prior to the new terms taking
							effect. Notices will be sent to the email address associated with
							your account or displayed prominently within the Service.
						</li>
					</ul>
					<p className="mt-2 text-muted-foreground leading-relaxed">
						By continuing to access or use our Service after those revisions
						become effective, you agree to be bound by the revised terms. If you
						do not agree to the new terms, you are no longer authorized to use
						the Service.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						10. Contact Us
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						If you have any questions about these Terms, please contact us at:{" "}
						<a
							className="text-primary hover:underline"
							href="mailto:support@evoxexam.xyz"
						>
							support@evoxexam.xyz
						</a>
					</p>
				</section>
			</div>
		</div>
	);
}
