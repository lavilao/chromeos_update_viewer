export type UpdateStatus =
	| "idle"
	| "checking"
	| "downloading"
	| "installing"
	| "up_to_date"
	| "error";

export interface ProgressData {
	percent: number;
	bytesDownloaded: number;
	bytesTotal: number;
	operationsCompleted: number;
	operationsTotal: number;
}

export interface UpdateInfo {
	status: UpdateStatus;
	progress?: ProgressData;
	version?: string;
	errorMessage?: string;
	lastChecked?: string;
	updateSize?: string;
	targetVersion?: string;
}

export interface UpdateError {
	message: string;
	timestamp: string;
	code?: string;
}

export interface UpdateStatusFromDOM {
	version: string;
	status: string;
	progress?: number;
	errorMessage?: string;
}
