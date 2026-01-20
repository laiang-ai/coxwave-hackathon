import type { WorkflowEvent } from "./workflow";

// ANSI color codes for terminal output
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	cyan: "\x1b[36m",
	green: "\x1b[32m",
	blue: "\x1b[34m",
	red: "\x1b[31m",
	magenta: "\x1b[35m",
} as const;

// Symbols for visual distinction
const symbols = {
	phaseStart: ">>>",
	phaseComplete: "<<<",
	agentStart: "  ->",
	agentComplete: "  <-",
	complete: "[OK]",
	error: "[ERR]",
} as const;

type LogLevel = "silent" | "info" | "debug";

function getLogLevel(): LogLevel {
	const level = process.env.WORKFLOW_LOG_LEVEL?.toLowerCase();
	if (level === "silent" || level === "info" || level === "debug") {
		return level;
	}
	return "info";
}

function formatTimestamp(): string {
	return new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
}

// Track timing for debug mode
const phaseTimings = new Map<string, number>();
const agentTimings = new Map<string, number>();

export function logWorkflowEvent(event: WorkflowEvent): void {
	const level = getLogLevel();
	if (level === "silent") return;

	const timestamp = formatTimestamp();
	const { reset, bright, dim, cyan, green, blue, red, magenta } = colors;
	const now = Date.now();

	switch (event.type) {
		case "phase-start":
			phaseTimings.set(event.phase, now);
			console.log(
				`${dim}[${timestamp}]${reset} ${cyan}${symbols.phaseStart}${reset} ${bright}Phase: ${event.phase}${reset} - ${event.message}`,
			);
			break;

		case "phase-complete": {
			const startTime = phaseTimings.get(event.phase);
			const duration = startTime ? now - startTime : null;
			phaseTimings.delete(event.phase);

			console.log(
				`${dim}[${timestamp}]${reset} ${green}${symbols.phaseComplete}${reset} ${bright}Phase: ${event.phase}${reset} - ${event.message}`,
			);
			if (level === "debug" && duration !== null) {
				console.log(`${dim}    Duration: ${duration}ms${reset}`);
			}
			break;
		}

		case "agent-start":
			agentTimings.set(event.agent, now);
			console.log(
				`${dim}[${timestamp}]${reset} ${blue}${symbols.agentStart}${reset} Agent: ${event.agent} - ${event.message}`,
			);
			break;

		case "agent-complete": {
			const startTime = agentTimings.get(event.agent);
			const duration = startTime ? now - startTime : null;
			agentTimings.delete(event.agent);

			console.log(
				`${dim}[${timestamp}]${reset} ${green}${symbols.agentComplete}${reset} Agent: ${event.agent} - ${event.message}`,
			);
			if (level === "debug" && duration !== null) {
				console.log(`${dim}    Duration: ${duration}ms${reset}`);
			}
			break;
		}

		case "complete":
			console.log(
				`${dim}[${timestamp}]${reset} ${magenta}${symbols.complete}${reset} ${bright}Workflow completed successfully${reset}`,
			);
			break;

		case "error":
			console.error(
				`${dim}[${timestamp}]${reset} ${red}${symbols.error}${reset} ${bright}Workflow error:${reset} ${event.error}`,
			);
			break;
	}
}
