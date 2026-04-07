import { ConvexError } from "convex/values";

/**
 * Generates a cryptographically secure, random 6-digit access code.
 * Uses rejection sampling to ensure every possible 6-digit number
 * (from 100,000 to 999,999) has an identical probability of being chosen.
 *
 * @returns A string representing the generated 6-digit access code.
 */
export function generateAccessCode() {
	const maxValue = 900000;

	// Calculate the largest multiple of 900k that fits in 32 bits
	const upperBound = Math.floor(0x1_0000_0000 / maxValue) * maxValue;

	const buffer = new Uint32Array(1);
	let randomValue = 0;

	do {
		// Fill buffer with hardware-generated random bits
		crypto.getRandomValues(buffer);
		randomValue = buffer[0] ?? 0;

		// If the value is in the "leftover" range above our upperBound,
		// we discard and retry to keep the probability of every number identical
	} while (randomValue >= upperBound);

	// Turn the random value into a number between 100,000 and 999,999
	return (100000 + (randomValue % maxValue)).toString();
}

/**
 * Validates the duration of an exam.
 * Ensures the duration is between 1 minute and 24 hours.
 *
 * @param duration - The duration in milliseconds to validate.
 * @throws {ConvexError} If the duration is less than 1 minute or greater than 24 hours.
 */
export function validateExamDuration(duration: number) {
	if (duration < 60000) {
		throw new ConvexError("Duration must be at least 1 minute");
	}
	if (duration > 24 * 60 * 60 * 1000) {
		throw new ConvexError("Duration cannot exceed 24 hours");
	}
}

/**
 * Validates the title of an exam.
 * Ensures the title is not empty or composed solely of whitespace.
 *
 * @param title - The title string to validate.
 * @throws {ConvexError} If the title is empty or null.
 */
export function validateExamTitle(title: string) {
	if (!title || title.trim().length === 0) {
		throw new ConvexError("Title cannot be empty");
	}
}

/**
 * Mulberry32 PRNG - returns a function that generates deterministic pseudorandom numbers
 * between 0 (inclusive) and 1 (exclusive) based on the provided 32-bit integer seed.
 *
 * @param seed - The 32-bit integer seed for the PRNG.
 * @returns A function that, when called, returns the next pseudorandom number.
 */
export function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Performs a deterministic Fisher-Yates shuffle on an array using a seeded PRNG.
 *
 * @template T - The type of elements in the array.
 * @param array - The array to be shuffled (a copy will be returned).
 * @param seed - The seed used to initialize the PRNG for consistent results.
 * @returns A new array containing the shuffled elements.
 */
export function seededShuffle<T>(array: T[], seed: number): T[] {
	const shuffled = [...array];
	const random = mulberry32(seed);
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j] as T, shuffled[i] as T];
	}
	return shuffled;
}

/**
 * Generates a shuffled list of answer indices for a specific question.
 * Uses a combined seed (based on the original seed and question index) to ensure
 * that different questions within the same exam have different shuffles.
 *
 * @param optionsLength - The number of answer options to shuffle.
 * @param seed - The base seed for the exam.
 * @param questionIndex - The index of the question to determine its specific shuffle.
 * @returns An array of shuffled indices.
 */
export function getShuffledAnswerIndices(
	optionsLength: number,
	seed: number,
	questionIndex: number,
): number[] {
	// Use a combined seed for each question to ensure different shuffles per question
	const combinedSeed = seed + questionIndex * 31337;
	const indices = Array.from({ length: optionsLength }, (_, i) => i);
	return seededShuffle(indices, combinedSeed);
}
