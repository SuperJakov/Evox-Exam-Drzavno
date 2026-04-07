import type { Id } from "convex/_generated/dataModel";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { atomFamily } from "jotai-family";

const storage = createJSONStorage<string>(() => sessionStorage);

export const activeTabAtomFamily = atomFamily((examId: string) =>
	atomWithStorage(`edit-exam-tab-${examId}`, "questions", storage),
);

export const questionToDeleteAtom = atom<Id<"questions"> | null>(null);
export const questionToEditAtom = atom<Id<"questions"> | null>(null);
export const submissionToDeleteAtom = atom<{
	id: Id<"submissions">;
	participantName: string;
} | null>(null);
export const isDurationDialogOpenAtom = atom(false);
export const isActivateDialogOpenAtom = atom(false);
