import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description:
		"Privacy Policy for Evox Exam platform. Learn how we handle your data.",
	keywords: ["privacy policy", "data protection", "gdpr", "evox exam"],
	alternates: {
		canonical: "https://www.evoxexam.xyz/privacy",
	},
};

export default function PrivacyPage() {
	// Static date to avoid hydration mismatch
	const effectiveDate = "January 10, 2026";

	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<div className="mb-10 text-center">
				<h1 className="font-extrabold text-4xl text-foreground tracking-tight">
					Privacy Policy
				</h1>
				<p className="mt-2 text-muted-foreground">
					Effective Date: {effectiveDate}
				</p>
			</div>

			<div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						1. Introduction
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						Welcome to Evox Exam. We respect your privacy and are committed to
						protecting your personal data. This Privacy Policy explains how we
						collect, use, and share information about you when you use our
						platform, in compliance with the General Data Protection Regulation
						(GDPR).
					</p>
					<p className="mt-2 text-muted-foreground leading-relaxed">
						The <strong>Data Controller</strong> responsible for your
						information is <strong>The Evox Exam Team</strong>, located in{" "}
						<strong>Croatia</strong>.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						2. Information We Collect
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						We collect different types of information to provide our exam
						services effectively:
					</p>
					<ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
						<li>
							<strong>Identity Data:</strong> Name, username, email address, and
							profile picture.
						</li>
						<li>
							<strong>Exam Data:</strong> Questions created, answers submitted,
							test scores, completion time, real-time online presence status
							during an exam, and feedback provided within the platform.
						</li>
						<li>
							<strong>Technical Data:</strong> Internet Protocol (IP) address,
							browser type and version, time zone setting, operating system,
							device information, and specific interactions during an exam (such
							as switching tabs, losing window focus, or exiting fullscreen
							mode). This is used for security and anti-cheat mechanisms.
						</li>
						<li>
							<strong>Usage Data:</strong> Information about how you use our
							website (e.g., pages visited, session duration).
						</li>
					</ul>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						3. Legal Basis for Processing (GDPR)
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						Under GDPR, we rely on the following legal bases to process your
						personal data:
					</p>
					<ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
						<li>
							<strong>Contractual Necessity:</strong> We need to process your
							Identity and Exam Data to create your account, administer exams,
							and grade results as per our Terms of Service.
						</li>
						<li>
							<strong>Legitimate Interests:</strong> We process Technical Data
							to maintain platform security, prevent fraud (cheating), and
							improve our services.
						</li>
						<li>
							<strong>Legal Obligation:</strong> We may keep certain records to
							comply with tax or legal requirements.
						</li>
					</ul>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						4. Data Retention
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						We will only retain your personal data for as long as necessary to
						fulfill the purposes we collected it for, including for the purposes
						of satisfying any legal, accounting, or reporting requirements.
					</p>
					<p className="mt-2 text-muted-foreground leading-relaxed">
						Generally, account data is kept until you delete your account. Exam
						results may be anonymized and retained for analytical purposes.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						5. Information Sharing
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						We do not sell your personal data. We may share your data with:
					</p>
					<ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
						<li>
							<strong>Service Providers:</strong> Third-party companies that
							provide hosting, database management, and email services. They are
							authorized to use your personal data only as necessary to provide
							these services to us.
						</li>
						<li>
							<strong>Legal Authorities:</strong> If required by law or in
							response to valid requests by public authorities.
						</li>
					</ul>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						6. International Data Transfers
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						Some of our external third parties (like cloud hosting providers)
						are based outside the European Economic Area (EEA) (e.g., in the
						USA). Whenever we transfer your personal data out of the EEA, we
						ensure a similar degree of protection is afforded to it by using
						specific contracts approved by the European Commission (Standard
						Contractual Clauses).
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						7. Your Data Protection Rights
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						If you are a resident of the EEA, you have the following rights:
					</p>
					<ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
						<li>
							<strong>Right to Access:</strong> You can request copies of your
							personal data.
						</li>
						<li>
							<strong>Right to Rectification:</strong> You can request that we
							correct any information you believe is inaccurate.
						</li>
						<li>
							<strong>Right to Erasure ("Right to be Forgotten"):</strong> You
							can request that we erase your personal data, under certain
							conditions.
						</li>
						<li>
							<strong>Right to Restrict Processing:</strong> You can request
							that we restrict the processing of your personal data.
						</li>
						<li>
							<strong>Right to Data Portability:</strong> You can request that
							we transfer the data that we have collected to another
							organization, or directly to you.
						</li>
					</ul>
					<p className="mt-2 text-muted-foreground leading-relaxed">
						To exercise these rights, please contact us at{" "}
						<a
							className="text-primary hover:underline"
							href="mailto:support@evoxexam.xyz"
						>
							support@evoxexam.xyz
						</a>
						.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						8. Cookies
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						We use essential cookies to keep you logged in and ensure the
						platform functions correctly. We do not use tracking or advertising
						cookies without your explicit consent. You can set your browser to
						refuse all or some browser cookies, but this may cause parts of the
						Service to function incorrectly.
					</p>
				</section>

				<section>
					<h2 className="mb-4 font-semibold text-2xl tracking-tight">
						9. Contact Us
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						If you have any questions about this Privacy Policy or wish to
						exercise your rights, please contact us at:{" "}
						<a
							className="text-primary hover:underline"
							href="mailto:support@evoxexam.xyz"
						>
							support@evoxexam.xyz
						</a>
						.
					</p>
				</section>
			</div>
		</div>
	);
}
