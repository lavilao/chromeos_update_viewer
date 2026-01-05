/**
 * Update info component for displaying progress details
 */

import type { ProgressData } from "../../types/update";
import { ProgressBar } from "./ProgressBar";

interface UpdateInfoProps {
	progress?: ProgressData;
	updateSize?: string;
}

const formatBytes = (bytes: number): string => {
	const units = ["B", "KB", "MB", "GB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export function UpdateInfo({ progress, updateSize }: UpdateInfoProps) {
	if (!progress) return null;

	const { percent, bytesDownloaded, bytesTotal, operationsCompleted, operationsTotal } =
		progress;

	return (
		<div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
			<h4 className="font-semibold text-gray-800 mb-3">
				Progress Details
			</h4>

			<ProgressBar percent={percent} label="Download Progress" />

			<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
				<div className="bg-white rounded p-3 border border-gray-200">
					<div className="text-gray-500 mb-1">Downloaded</div>
					<div className="font-semibold text-gray-800">
						{formatBytes(bytesDownloaded)}
						{bytesTotal > 0 && (
							<span className="text-gray-500 font-normal">
								{" "}
								/ {formatBytes(bytesTotal)}
							</span>
						)}
					</div>
				</div>

				<div className="bg-white rounded p-3 border border-gray-200">
					<div className="text-gray-500 mb-1">Update Size</div>
					<div className="font-semibold text-gray-800">
						{updateSize || formatBytes(bytesTotal)}
					</div>
				</div>

				<div className="bg-white rounded p-3 border border-gray-200">
					<div className="text-gray-500 mb-1">Operations</div>
					<div className="font-semibold text-gray-800">
						{operationsCompleted}
						{operationsTotal > 0 && (
							<span className="text-gray-500 font-normal">
								{" "}
								/ {operationsTotal}
							</span>
						)}
					</div>
				</div>

				<div className="bg-white rounded p-3 border border-gray-200">
					<div className="text-gray-500 mb-1">Progress</div>
					<div className="font-semibold text-gray-800">
						{percent}%
					</div>
				</div>
			</div>
		</div>
	);
}
