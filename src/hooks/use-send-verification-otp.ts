"use client";

import { api } from "convex/_generated/api";
import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Includes the logic for sending an email OTP for account verification.
 *
 * Wraps the `auth.verification.sendVerificationOtp` Convex action and manages
 * its loading state. Shows a success or error toast after each
 * attempt. If `email` is missing, the send is rejected immediately with an
 * error toast.
 *
 * @returns An object containing:
 *   - `sendOtp(email?)` - async function that triggers the OTP dispatch.
 *     Resolves on success, re-throws the original error on failure so callers
 *     can react if needed.
 *   - `isLoading` - `true` while the action is in-flight.
 */
export function useSendVerificationOtp() {
	const [isLoading, setIsLoading] = useState(false);
	const sendVerificationOtpAction = useAction(
		api.auth.verification.sendVerificationOtp,
	);

	const sendOtp = async (email?: string | null) => {
		if (!email) {
			toast.error("Email is missing");
			return Promise.reject(new Error("Email is missing"));
		}

		setIsLoading(true);
		try {
			await sendVerificationOtpAction({ email });
			toast.success("Verification code sent!");
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to send verification code";
			toast.error(message);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		sendOtp,
		isLoading,
	};
}
