/**
 * Background service worker for ChromeOS Update Viewer
 * Coordinates update status collection and storage
 */

import { parseUpdateLogs } from "./utils/logParser";
import type { UpdateInfo } from "./types/update";

const STORAGE_KEY = "updateStatus";
const REFRESH_INTERVAL_MS = 5000;

/**
 * Initialize default update status
 */
const initializeDefaultStatus = (): UpdateInfo => {
	return {
		status: "idle",
		lastChecked: new Date().toISOString(),
	};
};

/**
 * Save update status to storage
 */
const saveUpdateStatus = async (status: UpdateInfo): Promise<void> => {
	try {
		await chrome.storage.local.set({ [STORAGE_KEY]: status });
	} catch (error) {
		console.error("Error saving update status:", error);
	}
};

/**
 * Load update status from storage
 */
const loadUpdateStatus = async (): Promise<UpdateInfo> => {
	try {
		const result = await chrome.storage.local.get(STORAGE_KEY);
		return result[STORAGE_KEY] || initializeDefaultStatus();
	} catch (error) {
		console.error("Error loading update status:", error);
		return initializeDefaultStatus();
	}
};

/**
 * Handle manual log input from user
 */
const handleManualLogInput = async (
	logContent: string,
): Promise<{ success: boolean; status?: UpdateInfo; error?: string }> => {
	try {
		// Parse log content line by line
		const lines = logContent.split("\n").filter((line) => line.trim());
		const updateInfo = parseUpdateLogs(lines);

		// Save to storage
		await saveUpdateStatus(updateInfo);

		return { success: true, status: updateInfo };
	} catch (error) {
		console.error("Error parsing manual log input:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

/**
 * Handle request for update status (from popup)
 */
const handleGetUpdateStatus = async (): Promise<UpdateInfo> => {
	return loadUpdateStatus();
};

/**
 * Handle check for updates request
 */
const handleCheckForUpdates = async (): Promise<void> => {
	// Open ChromeOS settings page to trigger update check
	try {
		await chrome.tabs.create({
			url: "chrome://os-settings/about",
		});
	} catch (error) {
		console.error("Error opening settings page:", error);
	}
};

/**
 * Message handler for content script and popup communication
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	switch (message.type) {
		case "MANUAL_LOG_INPUT": {
			handleManualLogInput(message.payload).then((result) => {
				sendResponse(result);
			});
			return true; // Keep message channel open for async response
		}
		case "GET_UPDATE_STATUS": {
			handleGetUpdateStatus().then((status) => {
				sendResponse({ success: true, status });
			});
			return true; // Keep message channel open for async response
		}
		case "CHECK_FOR_UPDATES": {
			handleCheckForUpdates();
			sendResponse({ success: true });
			break;
		}
		default:
			console.warn("Unknown message type:", message.type);
			sendResponse({ success: false, error: "Unknown message type" });
	}
});

/**
 * Initialize extension
 */
const initializeExtension = async () => {
	const currentStatus = await loadUpdateStatus();

	// If status is very old (more than 1 hour), reset to idle
	if (currentStatus.lastChecked) {
		const lastChecked = new Date(currentStatus.lastChecked);
		const now = new Date();
		const hoursDiff = (now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60);

		if (hoursDiff > 1) {
			const defaultStatus = initializeDefaultStatus();
			await saveUpdateStatus(defaultStatus);
		}
	}
};

// Run initialization
initializeExtension().catch(console.error);

// uncomment if you want options.html to be opened after extension is installed
/*
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: 'options.html',
    });
  }
});
*/
