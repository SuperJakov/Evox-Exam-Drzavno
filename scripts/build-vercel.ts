#!/usr/bin/env bun

/*
 build-vercel.ts

 Unified build + Convex deploy + env setup script
 Deploy app with:
   bun run scripts/build-vercel.ts

 Changes from previous:
 - Runs `bunx convex deploy --cmd 'bun run build'` with streaming stdio so build logs appear live (Next.js/Turbopack output).
 - Keeps env set/list using synchronous capture to examine output.
 - Only sets SITE_URL for preview deployments (production skips env set because it's already set).
*/

import { spawn, spawnSync } from "node:child_process";

type ExecOpts = { silent?: boolean };
type ExecResult = { code: number; stdout: string; stderr: string };

/** Synchronous exec that captures stdout/stderr (used for small checks) */
function execCmd(cmd: string[], opts: ExecOpts = {}): ExecResult {
	const { silent = false } = opts;
	if (!silent) {
		console.log(
			`> ${cmd.map((s) => (s.includes(" ") ? `'${s}'` : s)).join(" ")}`,
		);
	}

	const [command, ...args] = cmd;
	if (!command) throw new Error("execCmd call with empty command array");

	const res = spawnSync(command, args, {
		encoding: "utf8",
		stdio: ["inherit", "pipe", "pipe"],
	});

	return {
		code: res.status ?? 0,
		stdout: res.stdout ?? "",
		stderr: res.stderr ?? "",
	};
}

/** Streaming exec: inherits stdio so child prints directly to the parent terminal
 *  Returns the exit code when the process exits.
 */
function execCmdStream(cmd: string[]): Promise<number> {
	console.log(
		`> ${cmd.map((s) => (s.includes(" ") ? `'${s}'` : s)).join(" ")}`,
	);
	const [command, ...args] = cmd;
	return new Promise((resolve, reject) => {
		if (!command) return reject(new Error("execCmdStream empty command"));

		const child = spawn(command, args, { stdio: "inherit" });

		child.on("error", (err) => {
			reject(err);
		});

		child.on("close", (code) => {
			resolve(code ?? 0);
		});
	});
}

function sleep(ms: number) {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function sanitizePreviewName(name: string): string {
	let sanitized = name.replace(/[/.]/g, "-");
	sanitized = sanitized.replace(/[^a-zA-Z0-9-_]/g, "");
	if (sanitized.length > 40) sanitized = sanitized.slice(0, 40);
	return sanitized || `preview-${Date.now()}`;
}

function logRelevantEnv() {
	console.log("Relevant environment variables:");
	[
		"VERCEL_ENV",
		"VERCEL_GIT_COMMIT_REF",
		"VERCEL_BRANCH_URL",
		"VERCEL_URL",
	].forEach((k) => {
		if (process.env[k]) console.log(`  ${k}=${process.env[k]}`);
	});
}

async function main() {
	try {
		logRelevantEnv();

		const VERCEL_ENV = process.env.VERCEL_ENV ?? "production";
		const isPreview = VERCEL_ENV === "preview";

		let commitRef = process.env.VERCEL_GIT_COMMIT_REF;
		if (!commitRef) {
			commitRef = `manual-deploy-${Date.now()}`;
			console.warn(
				`WARNING: VERCEL_GIT_COMMIT_REF not set, using ${commitRef}`,
			);
		}

		let SITE_URL = "";
		let urlSource = "";

		if (process.env.VERCEL_BRANCH_URL) {
			SITE_URL = `https://${process.env.VERCEL_BRANCH_URL}`;
			urlSource = "VERCEL_BRANCH_URL";
		} else if (process.env.VERCEL_URL) {
			SITE_URL = `https://${process.env.VERCEL_URL}`;
			urlSource = "VERCEL_URL";
		} else {
			console.error(
				"ERROR: No deployment URL found (VERCEL_BRANCH_URL or VERCEL_URL missing)",
			);
			process.exit(1);
		}

		console.log(`Deployment type: ${VERCEL_ENV}`);
		console.log(`Resolved SITE_URL: ${SITE_URL} (${urlSource})`);

		const previewName = sanitizePreviewName(commitRef);
		if (previewName !== commitRef) {
			console.log(`Sanitized preview name: ${previewName}`);
		}

		// --- Convex deploy + build step (streaming) ---
		console.log(
			"Starting Convex deploy (this will run the build and stream logs)...",
		);

		const deployArgs = ["bunx", "convex", "deploy", "--cmd", "bun run build"];
		if (isPreview) {
			deployArgs.push("--preview-create", previewName);
		}

		// Run the deploy with inherited stdio so Next.js build logs appear live.
		const deployExitCode = await execCmdStream(deployArgs);

		if (deployExitCode !== 0) {
			console.error(
				`ERROR: Convex deploy failed (exit code ${deployExitCode})`,
			);
			process.exit(1);
		}

		console.log("Convex deploy completed successfully");

		// If this is production, SITE_URL and envs are already handled - print final URL and exit.
		if (!isPreview) {
			console.log("");
			console.log("Deployment completed successfully");
			console.log(`The site is available at: ${SITE_URL}`);
			console.log("");
			process.exit(0);
		}

		// --- Set Convex environment variables (sync/captured) for preview only ---
		console.log("Setting Convex environment variables (preview) ...");

		const maxRetries = 3;
		const retryDelayMs = 5000;

		let attempt = 0;
		let lastError = "";

		while (attempt < maxRetries) {
			console.log(`Attempt ${attempt + 1} of ${maxRetries}`);

			const envArgs = ["bunx", "convex", "env", "set", "SITE_URL", SITE_URL];
			if (isPreview) envArgs.push("--preview-name", previewName);

			const res = execCmd(envArgs);

			if (res.code === 0) {
				console.log("SITE_URL set successfully");

				console.log("Verifying environment variable...");
				const listArgs = ["bunx", "convex", "env", "list"];
				if (isPreview) listArgs.push("--preview-name", previewName);

				const verify = execCmd(listArgs, { silent: true });
				if ((verify.stdout + verify.stderr).includes("SITE_URL")) {
					console.log("Verification successful");
				} else {
					console.warn(
						"WARNING: SITE_URL not visible yet (possible propagation delay)",
					);
				}

				console.log("");
				console.log("Deployment completed successfully");
				console.log(`The site is available at: ${SITE_URL}`);
				console.log("");

				process.exit(0);
			}

			lastError = res.stderr || res.stdout;
			console.error("Failed to set SITE_URL");
			console.error(lastError);

			const lower = lastError.toLowerCase();
			if (lower.includes("not authenticated")) {
				console.error("Convex CLI not authenticated. Run 'bunx convex auth'.");
				process.exit(1);
			}

			attempt++;
			if (attempt < maxRetries) {
				console.log(`Retrying in ${retryDelayMs / 1000}s...`);
				sleep(retryDelayMs);
			}
		}

		console.error(
			"ERROR: Failed to set Convex environment variables after retries",
		);
		console.error(lastError);
		process.exit(1);
	} catch (err) {
		console.error("Fatal error in build-vercel.ts:", err);
		process.exit(1);
	}
}

main();
