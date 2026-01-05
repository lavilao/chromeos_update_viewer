/**
 * Status display component for showing update status
 */

import type { UpdateStatus } from "../../types/update";

const STATUS_CONFIG = {
	idle: {
		label: "Idle",
		description: "No updates in progress",
		color: "gray",
		icon: "⏸️",
	},
	checking: {
		label: "Checking for updates",
		description: "Verifying available updates...",
		color: "blue",
		icon: "🔍",
	},
	downloading: {
		label: "Downloading update",
		description: "Update is being downloaded",
		color: "blue",
		icon: "📥",
	},
	installing: {
		label: "Installing update",
		description: "Update is being installed",
		color: "blue",
		icon: "⚙️",
	},
	up_to_date: {
		label: "Up to date",
		description: "ChromeOS is updated",
		color: "green",
		icon: "✅",
	},
	error: {
		label: "Update error",
		description: "An error occurred during update",
		color: "red",
		icon: "❌",
	},
} as const;

interface StatusDisplayProps {
	status: UpdateStatus;
	version?: string;
	lastChecked?: string;
}

const COLOR_CLASSES = {
	gray: {
		bg: "bg-gray-100",
		text: "text-gray-800",
		border: "border-gray-300",
	},
	blue: {
		bg: "bg-blue-50",
		text: "text-blue-800",
		border: "border-blue-300",
	},
	green: {
		bg: "bg-green-50",
		text: "text-green-800",
		border: "border-green-300",
	},
	red: {
		bg: "bg-red-50",
		text: "text-red-800",
		border: "border-red-300",
	},
} as const;

export function StatusDisplay({
	status,
	version,
	lastChecked,
}: StatusDisplayProps) {
	const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
	const colors = COLOR_CLASSES[config.color as keyof typeof COLOR_CLASSES];

	const formatLastChecked = (timestamp?: string) => {
		if (!timestamp) return "Unknown";

		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));

		if (diffMins < 1) return "Just now";
		if (diffMins < 60) return `${diffMins} min ago`;
		if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
		return `${Math.floor(diffMins / 1440)}d ago`;
	};

	return (
		<div
			className={`rounded-lg border-2 p-4 mb-4 ${colors.bg} ${colors.border}`}
		>
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-3">
					<span className="text-2xl" role="img" aria-label="status icon">
						{config.icon}
					</span>
					<div>
						<h3
							className={`font-bold text-lg ${colors.text}`}
						>
							{config.label}
						</h3>
						<p className={`text-sm ${colors.text} opacity-80`}>
							{config.description}
						</p>
					</div>
				</div>
			</div>

			<div className="mt-3 space-y-2">
				{version && (
					<div className="flex justify-between text-sm">
						<span className="font-medium text-gray-600">Version:</span>
						<span className="font-mono text-gray-800">
							{version}
						</span>
					</div>
				)}
				<div className="flex justify-between text-sm">
					<span className="font-medium text-gray-600">
						Last checked:
					</span>
					<span className="text-gray-800">
						{formatLastChecked(lastChecked)}
					</span>
				</div>
			</div>
		</div>
	);
}
