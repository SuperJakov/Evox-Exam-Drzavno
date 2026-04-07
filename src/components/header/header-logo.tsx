import Image from "next/image";
import Link from "next/link";

export function HeaderLogo() {
	return (
		<>
			{/* Desktop Logo & Title */}
			<Link
				className="hidden items-center gap-2 font-bold text-xl min-[450px]:flex"
				href="/"
			>
				<Image
					alt="Evox Exam Logo"
					className="h-8 w-8"
					height={32}
					src="/logo.png"
					width={32}
				/>
				<span>Evox Exam</span>
			</Link>

			{/* Mobile Logo (Icon only) */}
			<Link className="flex items-center gap-2 min-[450px]:hidden" href="/">
				<Image
					alt="Evox Exam Logo"
					className="h-8 w-8"
					height={32}
					src="/logo.png"
					width={32}
				/>
			</Link>
		</>
	);
}
