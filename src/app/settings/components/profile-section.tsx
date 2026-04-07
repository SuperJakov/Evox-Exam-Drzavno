"use client";

import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { EditNameDialog } from "~/components/settings/edit-name-dialog";
import { Button } from "~/components/ui/button";
import { UserAvatar } from "~/components/user-avatar";
import { getTokenFromClient } from "~/lib/auth-client";
import { getConvexSiteUrl } from "~/lib/convex-site-url";

const uploadResponseSchema = z.object({
	storageId: z.string(),
	url: z.string(),
	blurDataUrl: z.string().optional(),
});

interface ProfileSectionProps {
	user: {
		firstName: string;
		lastName: string;
		email: string;
		image?: string | null;
	};
	profilePictureUrl?: {
		url: string;
		blurDataUrl?: string;
	} | null;
}

export function ProfileSection({
	user,
	profilePictureUrl,
}: ProfileSectionProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);
	const deleteProfilePicture = useMutation(
		api.profile.picture.deleteProfilePicture,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			toast.error("File size too large. Max 5MB");
			return;
		}

		setIsUploading(true);
		try {
			const convexSiteUrl = getConvexSiteUrl();
			const token = await getTokenFromClient();

			const response = await fetch(`${convexSiteUrl}/upload-avatar`, {
				method: "POST",
				body: file,
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || "Failed to upload image");
			}

			const rawData = await response.json();
			uploadResponseSchema.parse(rawData);

			toast.success("Profile picture updated successfully");
		} catch (error) {
			console.error(error);
			toast.error("Failed to update profile picture");
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleRemoveProfilePicture = async () => {
		setIsRemoving(true);
		try {
			await deleteProfilePicture();
			toast.success("Profile picture removed");
		} catch (error) {
			console.error(error);
			toast.error("Failed to remove profile picture");
		} finally {
			setIsRemoving(false);
		}
	};

	return (
		<div className="rounded-lg border bg-card">
			<div className="border-b p-6">
				<h3 className="font-semibold text-lg">Profile Information</h3>
				<p className="text-muted-foreground text-sm">
					Manage your personal information and profile picture.
				</p>
			</div>
			<div className="divide-y">
				{/* Profile Picture */}
				<div className="flex items-center justify-between p-6">
					<div className="flex items-center gap-4">
						<UserAvatar
							className="h-16 w-16 border-2 border-primary/10"
							fallbackClassName="text-lg"
							profilePictureUrl={profilePictureUrl}
							user={user}
						/>
						<div>
							<p className="font-medium">Profile Picture</p>
							<p className="text-muted-foreground text-sm">
								PNG, JPG up to 5MB
							</p>
						</div>
					</div>
					<div>
						<input
							accept="image/*"
							className="hidden"
							onChange={handleImageUpload}
							ref={fileInputRef}
							type="file"
						/>

						<Button
							className="h-9 w-9 p-0"
							disabled={isUploading}
							onClick={() => fileInputRef.current?.click()}
							size="sm"
							variant="ghost"
						>
							{isUploading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Pencil className="h-4 w-4" />
							)}
						</Button>

						{profilePictureUrl && (
							<Button
								className="ml-2 h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
								disabled={isRemoving || isUploading}
								onClick={handleRemoveProfilePicture}
								size="sm"
								variant="ghost"
							>
								{isRemoving ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Trash2 className="h-4 w-4" />
								)}
							</Button>
						)}
					</div>
				</div>

				{/* Name */}
				<div className="flex items-center justify-between p-6">
					<div className="flex-1">
						<p className="mb-1 font-medium text-muted-foreground text-sm">
							Name
						</p>
						<p className="font-medium">
							{user.firstName} {user.lastName}
						</p>
					</div>
					<EditNameDialog
						currentFirstName={user.firstName}
						currentLastName={user.lastName}
					>
						<Button className="h-9 w-9 p-0" size="sm" variant="ghost">
							<Pencil className="h-4 w-4" />
						</Button>
					</EditNameDialog>
				</div>

				{/* Email */}
				<div className="flex items-center justify-between p-6">
					<div className="flex-1">
						<p className="mb-1 font-medium text-muted-foreground text-sm">
							Email
						</p>
						<p className="font-medium">{user.email}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
