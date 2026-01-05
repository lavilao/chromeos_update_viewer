/**
 * Progress bar component for displaying update progress
 */

interface ProgressBarProps {
	percent: number;
	label?: string;
}

export function ProgressBar({ percent, label }: ProgressBarProps) {
	const clampedPercent = Math.min(Math.max(percent, 0), 100);
	const isComplete = clampedPercent >= 100;

	return (
		<div className="w-full">
			{label && (
				<div className="mb-2 flex justify-between items-center">
					<span className="text-sm font-medium text-gray-700">{label}</span>
					<span className="text-sm font-semibold text-blue-600">
						{clampedPercent}%
					</span>
				</div>
			)}
			<div className="h-3 bg-gray-200 rounded-full overflow-hidden">
				<div
					className={`h-full transition-all duration-300 ease-out ${
						isComplete ? "bg-green-500" : "bg-blue-600"
					}`}
					style={{ width: `${clampedPercent}%` }}
					role="progressbar"
					aria-valuenow={clampedPercent}
					aria-valuemin={0}
					aria-valuemax={100}
				/>
			</div>
		</div>
	);
}
