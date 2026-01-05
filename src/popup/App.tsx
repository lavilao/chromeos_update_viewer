/**
 * Main App component for ChromeOS Update Viewer popup
 */

import { useEffect, useState } from "react";
import type { UpdateInfo } from "../types/update";
import { StatusDisplay } from "./components/StatusDisplay";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { UpdateInfo as UpdateInfoComponent } from "./components/UpdateInfo";

export function App() {
	const [updateStatus, setUpdateStatus] = useState<UpdateInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showLogInput, setShowLogInput] = useState(false);
	const [logContent, setLogContent] = useState("");

	// Fetch update status from background script
	const fetchUpdateStatus = async () => {
		try {
			setError(null);
			const response = await chrome.runtime.sendMessage({
				type: "GET_UPDATE_STATUS",
			});

			if (response?.success && response?.status) {
				setUpdateStatus(response.status);
			} else {
				setError("Failed to fetch update status");
			}
		} catch (err) {
			console.error("Error fetching update status:", err);
			setError(
				err instanceof Error ? err.message : "Unknown error occurred",
			);
		} finally {
			setLoading(false);
		}
	};

	// Handle check for updates button
	const handleCheckForUpdates = async () => {
		try {
			await chrome.runtime.sendMessage({
				type: "CHECK_FOR_UPDATES",
			});
			// Close popup after initiating check
			window.close();
		} catch (err) {
			console.error("Error checking for updates:", err);
		}
	};

	// Handle manual log input
	const handleManualLogInput = async () => {
		if (!logContent.trim()) {
			setError("Please paste log content");
			return;
		}

		try {
			const response = await chrome.runtime.sendMessage({
				type: "MANUAL_LOG_INPUT",
				payload: logContent,
			});

			if (response?.success) {
				setUpdateStatus(response.status);
				setShowLogInput(false);
				setLogContent("");
			} else {
				setError("Failed to parse log content");
			}
		} catch (err) {
			console.error("Error parsing log:", err);
			setError(err instanceof Error ? err.message : "Unknown error");
		}
	};

	// Auto-refresh if status is active (downloading, installing, checking)
	useEffect(() => {
		if (!updateStatus) {
			fetchUpdateStatus();
			return;
		}

		const activeStatuses = ["checking", "downloading", "installing"];
		if (activeStatuses.includes(updateStatus.status)) {
			const intervalId = setInterval(() => {
				fetchUpdateStatus();
			}, 5000); // Refresh every 5 seconds

			return () => clearInterval(intervalId);
		}
	}, [updateStatus]);

	if (loading) {
		return (
			<div className="w-96 min-h-[400px] p-6 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
					<p className="text-gray-600">Loading update status...</p>
				</div>
			</div>
		);
	}

	if (showLogInput) {
		return (
			<div className="w-96 min-h-[500px] p-6 bg-white">
				<div className="mb-4">
					<h2 className="text-lg font-bold text-gray-800">
						Paste Update Log
					</h2>
					<p className="text-sm text-gray-500">
						Paste content from /var/log/update_engine.log
					</p>
				</div>

				<textarea
					value={logContent}
					onChange={(e) => setLogContent(e.target.value)}
					className="w-full h-64 p-3 border border-gray-300 rounded-lg text-xs font-mono resize-none"
					placeholder="Paste log lines here..."
				/>

				<div className="flex gap-2 mt-4">
					<button
						onClick={() => setShowLogInput(false)}
						className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
						type="button"
					>
						Cancel
					</button>
					<button
						onClick={handleManualLogInput}
						className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
						type="button"
					>
						Parse Log
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-96 min-h-[400px] p-6 bg-white">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-xl font-bold text-gray-800">
					ChromeOS Update Viewer
				</h1>
				<p className="text-sm text-gray-500">
					Monitor your ChromeOS update progress
				</p>
			</div>

			{!updateStatus ? (
				/* Initial State */
				<div className="text-center py-8">
					<div className="text-4xl mb-4">🔍</div>
					<h3 className="text-lg font-semibold text-gray-800 mb-2">
						No Update Data
					</h3>
					<p className="text-sm text-gray-600 mb-6">
						Choose how to monitor your update status
					</p>

					<div className="space-y-3">
						<button
							onClick={handleCheckForUpdates}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-left flex items-center gap-3"
							type="button"
						>
							<span className="text-2xl">🔄</span>
							<div>
								<div className="font-semibold">Check for Updates</div>
								<div className="text-xs opacity-80">
									Opens ChromeOS settings page
								</div>
							</div>
						</button>

						<button
							onClick={() => setShowLogInput(true)}
							className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors text-left flex items-center gap-3"
							type="button"
						>
							<span className="text-2xl">📋</span>
							<div>
								<div className="font-semibold">Paste Update Log</div>
								<div className="text-xs opacity-80">
									Parse log from update_engine.log
								</div>
							</div>
						</button>
					</div>
				</div>
			) : (
				/* Update Status Display */
				<>
					<StatusDisplay
						status={updateStatus.status}
						version={updateStatus.version}
						lastChecked={updateStatus.lastChecked}
					/>

					{/* Error Display */}
					<ErrorDisplay errorMessage={updateStatus.errorMessage} />

					{/* Progress Details */}
					<UpdateInfoComponent
						progress={updateStatus.progress}
						updateSize={updateStatus.updateSize}
					/>

					{/* Action Buttons */}
					<div className="flex gap-2 mt-6">
						<button
							onClick={fetchUpdateStatus}
							className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
							type="button"
						>
							Refresh
						</button>
						<button
							onClick={() => setShowLogInput(true)}
							className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
							type="button"
						>
							New Log
						</button>
						<button
							onClick={handleCheckForUpdates}
							className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
							type="button"
						>
							Check for Updates
						</button>
					</div>

					{/* Help Text */}
					<div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
						<p className="text-xs text-blue-800">
							📌 <strong>Note:</strong> Extensions cannot directly access
							ChromeOS system pages. To get real-time updates,
							visit{" "}
							<a
								href="chrome://os-settings/about"
								target="_blank"
								rel="noopener noreferrer"
								className="underline font-semibold hover:text-blue-600"
							>
								About ChromeOS
							</a>
							{" "}
							and paste recent log lines for detailed progress.
						</p>
					</div>
				</>
			)}

			{error && updateStatus && (
				<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-xs text-red-700">{error}</p>
				</div>
			)}
		</div>
	);
}
