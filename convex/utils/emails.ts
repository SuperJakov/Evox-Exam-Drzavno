const logoStringUrl = process.env.LOGO_URL;
const logoUrl = logoStringUrl ? logoStringUrl : null;

const BRAND = {
	name: "Evox Exam",
	url: process.env.SITE_URL,
	logo: logoUrl,
	colors: {
		primary: "#1bcc8f", // oklch(0.7227 0.192 149.5793)
		foreground: "#3d587a", // oklch(0.3729 0.0306 259.7328)
		background: "#f2f7fc", // oklch(0.9751 0.0127 244.2507)
		card: "#ffffff",
		muted: "#64748b",
		border: "#e2e8f0",
		warning: "#f59e0b",
		error: "#ef4444",
		success: "#10b981",
	},
	radius: "12px",
};

const commonStyles = {
	body: `margin: 0; padding: 0; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: ${BRAND.colors.background}; color: ${BRAND.colors.foreground};`,
	container: `width: 100%; max-width: 600px; margin: 0 auto; background-color: ${BRAND.colors.card}; border: 1px solid ${BRAND.colors.border}; border-radius: ${BRAND.radius}; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);`,
	content: "padding: 40px;",
	h1: `margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${BRAND.colors.foreground}; letter-spacing: -0.025em;`,
	p: `margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${BRAND.colors.muted};`,
	footer: `padding: 30px; background-color: #f8fafc; border-top: 1px solid ${BRAND.colors.border}; text-align: center;`,
	footerText: `margin: 0; font-size: 13px; color: ${BRAND.colors.muted}; line-height: 1.6;`,
};

function layout(content: string, title: string) {
	return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                @media only screen and (max-width: 620px) {
                    .container { width: 100% !important; border-radius: 0 !important; border: none !important; }
                    .content { padding: 30px 20px !important; }
                }
            </style>
        </head>
        <body style="${commonStyles.body}">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table class="container" width="600" cellpadding="0" cellspacing="0" style="${commonStyles.container}">
                            <!-- Header with Logo -->
                            <tr>
                                <td style="padding: 40px 40px 0; text-align: center;">
                                    <a href="${BRAND.url}" style="text-decoration: none;">
                                        <img src="${BRAND.logo}" alt="${BRAND.name}" width="48" height="48" style="margin-bottom: 20px; border-radius: 8px;">
                                    </a>
                                </td>
                            </tr>
                            
                            <!-- Main Content -->
                            <tr>
                                <td class="content" style="${commonStyles.content}">
                                    ${content}
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="${commonStyles.footer}">
                                    <p style="${commonStyles.footerText}">
                                        Questions? <a href="mailto:support@evoxexam.xyz" style="color: ${BRAND.colors.primary}; text-decoration: none;">We're here to help</a>
                                    </p>
                                    <p style="${commonStyles.footerText}; margin-top: 8px;">
                                        © ${new Date().getFullYear()} ${BRAND.name}. Built for modern exams.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
}

type UserRole = "teacher" | "student";

type EmailProps =
	| {
			type: "email-verification" | "sign-in" | "forget-password";
			otp: string;
	  }
	| {
			type: "reset-password" | "delete-account";
			url: string;
			name?: string;
	  }
	| {
			type: "password-changed";
	  }
	| {
			type: "welcome";
			role?: UserRole;
			name?: string;
	  }
	| {
			type: "exam-graded";
			name?: string;
			examTitle: string;
			score: number;
			totalPoints: number;
			submissionsUrl: string;
	  };

export function generateEmail(props: EmailProps) {
	const { type } = props;
	const otp = "otp" in props ? props.otp : "";
	const url = "url" in props ? props.url : "";
	const name = "name" in props ? props.name : undefined;
	const role = "role" in props ? (props.role ?? "teacher") : "teacher";
	const greeting = name ? `Hi ${name},` : "Hi there,";
	const examTitle = "examTitle" in props ? props.examTitle : "";
	const score = "score" in props ? props.score : 0;
	const totalPoints = "totalPoints" in props ? props.totalPoints : 0;
	const submissionsUrl = "submissionsUrl" in props ? props.submissionsUrl : "";
	const percentage =
		totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
	const scoreColor =
		percentage >= 70
			? BRAND.colors.success
			: percentage >= 50
				? BRAND.colors.warning
				: BRAND.colors.error;

	const templates = {
		"email-verification": {
			subject: `Verify your ${BRAND.name} account`,
			content: `
                <h1 style="${commonStyles.h1}">Welcome to ${BRAND.name}! 👋</h1>
                <p style="${commonStyles.p}">We're excited to have you on board. To complete your registration and verify your email address, please use the magic code below:</p>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                        <td align="center" style="background-color: ${BRAND.colors.background}; border: 2px solid ${BRAND.colors.primary}20; border-radius: 12px; padding: 32px;">
                            <div style="font-size: 38px; font-weight: 800; letter-spacing: 0.2em; color: ${BRAND.colors.primary}; font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, monospace;">
                                ${otp}
                            </div>
                        </td>
                    </tr>
                </table>
                
                <p style="${commonStyles.p}">This code expires in 10 minutes. If you didn't create an account, you can safely ignore this email.</p>
                
                <div style="margin-top: 30px; padding: 16px; background-color: #fffbeb; border-left: 4px solid ${BRAND.colors.warning}; border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                        <strong>Security Tip:</strong> Never share your verification code with anyone. Our team will never ask for it.
                    </p>
                </div>
            `,
		},
		"sign-in": {
			subject: `Your ${BRAND.name} sign-in code`,
			content: `
                <h1 style="${commonStyles.h1}">Sign in to ${BRAND.name}</h1>
                <p style="${commonStyles.p}">Welcome back! Use the verification code below to securely sign in to your account:</p>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                        <td align="center" style="background-color: ${BRAND.colors.background}; border: 2px solid ${BRAND.colors.primary}20; border-radius: 12px; padding: 32px;">
                            <div style="font-size: 38px; font-weight: 800; letter-spacing: 0.2em; color: ${BRAND.colors.primary}; font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, monospace;">
                                ${otp}
                            </div>
                        </td>
                    </tr>
                </table>
                
                <p style="${commonStyles.p}">This code is valid for 10 minutes. If you weren't expecting this, we recommend updating your security settings.</p>
            `,
		},
		"forget-password": {
			subject: "Reset your password",
			content: `
                <h1 style="${commonStyles.h1}">Reset your password</h1>
                <p style="${commonStyles.p}">We received a request to reset your password. Use the code below to proceed with the reset process:</p>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                        <td align="center" style="background-color: ${BRAND.colors.background}; border: 2px solid ${BRAND.colors.primary}20; border-radius: 12px; padding: 32px;">
                            <div style="font-size: 38px; font-weight: 800; letter-spacing: 0.2em; color: ${BRAND.colors.primary}; font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, monospace;">
                                ${otp}
                            </div>
                        </td>
                    </tr>
                </table>
                
                <p style="${commonStyles.p}">For security, this code expires in 10 minutes. If you didn't request a password reset, your account is still secure and no further action is needed.</p>
                
                <div style="margin-top: 30px; padding: 16px; background-color: #fef2f2; border-left: 4px solid ${BRAND.colors.error}; border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
                        <strong>Important:</strong> If you didn't request this code, someone might be trying to access your account.
                    </p>
                </div>
            `,
		},
		"reset-password": {
			subject: "Reset your password",
			content: `
                <h1 style="${commonStyles.h1}">Reset your password</h1>
                <p style="${commonStyles.p}">We received a request to reset your password. Click the button below to choose a new password:</p>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                        <td align="center">
                            <a href="${url}" style="display: inline-block; padding: 16px 32px; background-color: ${BRAND.colors.primary}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                                Reset Password
                            </a>
                        </td>
                    </tr>
                </table>
                
                <p style="${commonStyles.p}">If the button above doesn't work, you can also copy and paste this link into your browser:</p>
                <p style="${commonStyles.p}; font-size: 14px; word-break: break-all;">
                    <a href="${url}" style="color: ${BRAND.colors.primary};">${url}</a>
                </p>
                
                <div style="margin-top: 30px; padding: 16px; background-color: #fef2f2; border-left: 4px solid ${BRAND.colors.error}; border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
                        <strong>Security Notice:</strong> If you didn't request this, please ignore this email. Your password will remain unchanged.
                    </p>
                </div>
            `,
		},
		"password-changed": {
			subject: "Your password has been changed",
			content: `
                <h1 style="${commonStyles.h1}">Password Changed Successfully</h1>
                <p style="${commonStyles.p}">This email is to confirm that the password for your ${BRAND.name} account has been changed.</p>
                
                <div style="margin: 30px 0; padding: 16px; background-color: #f0fdf4; border-left: 4px solid ${BRAND.colors.success}; border-radius: 6px;">
                    <p style="margin: 0; font-size: 13px; color: #166534; line-height: 1.5;">
                        If you made this change, you can safely ignore this email.
                    </p>
                </div>

                <p style="${commonStyles.p}">If you did not make this change, please contact our support team immediately.</p>
            `,
		},
		"delete-account": {
			subject: `Confirm account deletion for ${BRAND.name}`,
			content: `
                <h1 style="${commonStyles.h1}">Delete your account</h1>
                <p style="${commonStyles.p}">We received a request to delete your ${BRAND.name} account. To proceed, please click the button below to confirm your identity and initiate the deletion process:</p>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                        <td align="center">
                            <a href="${url}" style="display: inline-block; padding: 16px 32px; background-color: ${BRAND.colors.error}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                                Confirm Deletion
                            </a>
                        </td>
                    </tr>
                </table>
                
                <div style="margin: 30px 0; padding: 20px; background-color: #fef2f2; border: 1px solid ${BRAND.colors.error}40; border-radius: 12px;">
                    <h2 style="margin: 0 0 10px; font-size: 18px; font-weight: 700; color: ${BRAND.colors.error};">Permanent Action</h2>
                    <p style="margin: 0; font-size: 15px; color: #991b1b; line-height: 1.6; font-weight: 500;">
                        Upon confirmation, <strong>all your data will be permanently purged</strong>. This includes your profile, exams, results, and cheating logs. 
                        This action is <strong>irreversible</strong>.
                    </p>
                </div>
                
                <p style="${commonStyles.p}">If the button doesn't work, copy and paste this link:</p>
                <p style="${commonStyles.p}; font-size: 14px; word-break: break-all;">
                    <a href="${url}" style="color: ${BRAND.colors.error};">${url}</a>
                </p>
                
                <p style="${commonStyles.p}; font-size: 14px; border-top: 1px solid ${BRAND.colors.border}; padding-top: 20px; margin-top: 20px;">
                    Didn't request this? Relax! Your account is safe. Just ignore this email.
                </p>
            `,
		},
		"exam-graded": {
			subject: `Your results for "${examTitle}" are ready`,
			content: `
                <h1 style="${commonStyles.h1}">Your exam results are in! 📊</h1>
                <p style="${commonStyles.p}">${greeting} Your submission for <strong>${examTitle}</strong> has been graded. Here's how you did:</p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                        <td align="center" style="background-color: ${BRAND.colors.background}; border: 2px solid ${scoreColor}30; border-radius: 12px; padding: 32px;">
                            <div style="font-size: 48px; font-weight: 800; color: ${scoreColor}; font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, monospace; letter-spacing: -0.02em;">
                                ${score}<span style="font-size: 28px; color: ${BRAND.colors.muted};">/${totalPoints}</span>
                            </div>
                            <div style="margin-top: 8px; font-size: 20px; font-weight: 600; color: ${scoreColor};">${percentage}%</div>
                        </td>
                    </tr>
                </table>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                        <td align="center">
                            <a href="${submissionsUrl}" style="display: inline-block; padding: 16px 32px; background-color: ${BRAND.colors.primary}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                                View Full Results
                            </a>
                        </td>
                    </tr>
                </table>

                <p style="${commonStyles.p}; font-size: 14px;">You can review your answers and see which questions you got right or wrong by clicking the button above.</p>
            `,
		},
		welcome:
			role === "student"
				? {
						subject: `Welcome to ${BRAND.name}!`,
						content: `
                <h1 style="${commonStyles.h1}">Welcome to ${BRAND.name}! 🎓</h1>
                <p style="${commonStyles.p}">${greeting} We're excited to have you here. ${BRAND.name} makes taking exams straightforward - no stress, just focus.</p>
                
                <h2 style="margin: 24px 0 12px; font-size: 18px; font-weight: 600; color: ${BRAND.colors.foreground};">How to take your first exam:</h2>
                <ol style="margin: 0 0 20px; padding-left: 20px; font-size: 16px; line-height: 1.6; color: ${BRAND.colors.muted};">
                    <li style="margin-bottom: 8px;">Go to the <a href="${BRAND.url}/join" style="color: ${BRAND.colors.primary}; text-decoration: none; font-weight: 500;">Join page</a> and join your exam there</li>
                    <li style="margin-bottom: 8px;">Click <strong>"Join Exam"</strong> and enter the access code from your teacher</li>
                    <li style="margin-bottom: 8px;">Read the instructions carefully before starting</li>
                    <li style="margin-bottom: 8px;">Answer all questions at your own pace within the time limit</li>
                    <li style="margin-bottom: 8px;">Submit your answers - results will be available once your teacher reviews them</li>
                </ol>

                <div style="margin: 30px 0; padding: 24px; background-color: ${BRAND.colors.background}; border-radius: 12px; text-align: center; border: 1px solid ${BRAND.colors.border};">
                    <p style="${commonStyles.p}; margin-bottom: 16px;">Have questions about how it works?</p>
                    <a href="${BRAND.url}/faq" style="display: inline-block; padding: 12px 28px; background-color: ${BRAND.colors.primary}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        Check out our FAQ
                    </a>
                </div>

                <p style="${commonStyles.p}">Good luck with your exams! If you need any help, our support team is just a reply away.</p>
            `,
					}
				: {
						subject: `Welcome to ${BRAND.name}!`,
						content: `
                <h1 style="${commonStyles.h1}">Welcome to ${BRAND.name}! 👋</h1>
                <p style="${commonStyles.p}">${greeting} We're thrilled to have you here. ${BRAND.name} is designed to help you create, manage, and conduct exams with ease and reliability.</p>
                
                <h2 style="margin: 24px 0 12px; font-size: 18px; font-weight: 600; color: ${BRAND.colors.foreground};">Get started in 5 easy steps:</h2>
                <ol style="margin: 0 0 20px; padding-left: 20px; font-size: 16px; line-height: 1.6; color: ${BRAND.colors.muted};">
                    <li style="margin-bottom: 8px;">Navigate to your <a href="${BRAND.url}/exams" style="color: ${BRAND.colors.primary}; text-decoration: none; font-weight: 500;">Exams Dashboard</a></li>
                    <li style="margin-bottom: 8px;">Click on the <strong>"Create New Exam"</strong> button</li>
                    <li style="margin-bottom: 8px;">Fill in your exam details and settings</li>
                    <li style="margin-bottom: 8px;">Add your questions and answers</li>
                    <li style="margin-bottom: 8px;"><strong>Publish</strong> your exam and share the unique access code with your students</li>
                </ol>
                
                <div style="margin: 30px 0; padding: 24px; background-color: ${BRAND.colors.background}; border-radius: 12px; text-align: center; border: 1px solid ${BRAND.colors.border};">
                    <p style="${commonStyles.p}; margin-bottom: 16px;">Want to learn more about our features?</p>
                    <a href="${BRAND.url}/faq" style="display: inline-block; padding: 12px 28px; background-color: ${BRAND.colors.primary}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        Check out our FAQ
                    </a>
                </div>
                
                <p style="${commonStyles.p}">If you need any assistance, simply reply to this email. Our team is always happy to help!</p>
            `,
					},
	};

	const template = templates[type] || templates["email-verification"];

	return {
		subject: template.subject,
		html: layout(template.content, template.subject),
	};
}
