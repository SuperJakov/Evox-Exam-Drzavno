import Loading from "~/app/loading";

export function LoadingState() {
	return (
		<div className="relative flex h-screen w-full items-center justify-center">
			<Loading />
		</div>
	);
}
