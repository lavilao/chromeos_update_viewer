/**
 * Utility functions for parsing update_engine.log
 * This is secondary/fallback method for getting update information
 */

import type { UpdateInfo, UpdateStatus, ProgressData } from "../types/update";

/**
 * Parse a single log line for progress information
 */
const parseProgressLine = (line: string): ProgressData | null => {
	// Pattern: "Completed X/Y operations (A%), B/C bytes downloaded (D%), overall progress E%"
	const progressRegex =
		/Completed\s+(\d+)\/(\d+)\s+operations\s+\((\d+)%\),\s+(\d+)\/(\d+)\s+bytes\s+downloaded\s+\((\d+)%\),\s+overall\s+progress\s+(\d+)%/;

	const match = line.match(progressRegex);
	if (!match) return null;

	return {
		percent: Number.parseInt(match[7], 10),
		bytesDownloaded: Number.parseInt(match[4], 10),
		bytesTotal: Number.parseInt(match[5], 10),
		operationsCompleted: Number.parseInt(match[1], 10),
		operationsTotal: Number.parseInt(match[2], 10),
	};
};

/**
 * Parse a single log line for error information
 */
const parseErrorLine = (line: string): string | null => {
	if (!line.includes("ERROR")) return null;

	// Extract error message after ERROR update_engine:
	const errorMatch = line.match(/ERROR\s+update_engine:.*?\]\s+(.+)$/);
	return errorMatch ? errorMatch[1].trim() : null;
};

/**
 * Detect update status from log content
 */
const detectStatusFromLogs = (logs: string[]): UpdateStatus => {
	const recentLogs = logs.slice(-50); // Check last 50 lines

	// Check for errors first
	const hasErrors = recentLogs.some((line) =>
		line.includes("ERROR") && !line.includes("Error counter"),
	);
	if (hasErrors) return "error";

	// Check for progress updates (downloading)
	const hasProgress = recentLogs.some((line) =>
		line.includes("overall progress"),
	);
	if (hasProgress) return "downloading";

	// Check for installing phase
	const hasInstalling = recentLogs.some((line) =>
		line.includes("installing") || line.includes("ApplyPayload"),
	);
	if (hasInstalling) return "installing";

	// Check for update check
	const hasChecking = recentLogs.some((line) =>
		line.includes("Checking for update") ||
		line.includes("Periodic check") ||
		line.includes("update attempt"),
	);
	if (hasChecking) return "checking";

	// Default to idle
	return "idle";
};

/**
 * Format bytes to human readable format
 */
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

/**
 * Parse log lines and extract update information
 */
export const parseUpdateLogs = (logLines: string[]): UpdateInfo => {
	// Filter to last 100 lines for efficiency
	const recentLogs = logLines.slice(-100);

	// Extract the most recent progress
	let progress: ProgressData | undefined;
	let errorMessage: string | undefined;

	for (let i = recentLogs.length - 1; i >= 0; i--) {
		const line = recentLogs[i];

		// Check for progress
		if (!progress) {
			const parsedProgress = parseProgressLine(line);
			if (parsedProgress) {
				progress = parsedProgress;
			}
		}

		// Check for errors
		if (!errorMessage) {
			const parsedError = parseErrorLine(line);
			if (parsedError) {
				errorMessage = parsedError;
			}
		}

		// Early exit if we found both
		if (progress && errorMessage) break;
	}

	// Detect status
	const status = detectStatusFromLogs(recentLogs);

	// Build update info
	const updateInfo: UpdateInfo = {
		status,
		lastChecked: new Date().toISOString(),
	};

	if (progress) {
		updateInfo.progress = progress;
		updateInfo.updateSize = formatBytes(progress.bytesTotal);
	}

	if (errorMessage) {
		updateInfo.errorMessage = errorMessage;
	}

	return updateInfo;
};

/**
 * Simulate reading log file (for testing without actual file access)
 * In a real Chrome extension, this would need to be done via a different method
 * since extensions cannot read arbitrary files
 */
export const getLogLinesFromFile = async (
	filePath: string,
): Promise<string[]> => {
	try {
		// Note: Chrome extensions cannot read arbitrary files
		// This is a placeholder for when we have a way to access logs
		// In production, this might be done via:
		// 1. A browser API if ChromeOS exposes one
		// 2. User selecting the file via file input
		// 3. Server-side processing if accessible

		// For now, return empty array
		return [];
	} catch (error) {
		console.error("Error reading log file:", error);
		return [];
	}
};
