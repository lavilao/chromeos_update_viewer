/**
 * Error display component for showing update errors
 */

interface ErrorDisplayProps {
	errorMessage?: string;
}

export function ErrorDisplay({ errorMessage }: ErrorDisplayProps) {
	if (!errorMessage) return null;

	return (
		<div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 mb-4">
			<div className="flex items-start gap-3">
				<span
					className="text-2xl"
					role="img"
					aria-label="error icon"
				>
					❌
				</span>
				<div className="flex-1">
					<h3 className="font-bold text-lg text-red-800 mb-1">
						Error Details
					</h3>
					<p className="text-sm text-red-700 whitespace-pre-wrap">
						{errorMessage}
					</p>
				</div>
			</div>
		</div>
	);
}
