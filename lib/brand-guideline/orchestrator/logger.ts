import type { WorkflowEvent } from "./workflow";

// ANSI color codes for terminal output
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	italic: "\x1b[3m",
	underline: "\x1b[4m",
	cyan: "\x1b[36m",
	green: "\x1b[32m",
	blue: "\x1b[34m",
	red: "\x1b[31m",
	magenta: "\x1b[35m",
	yellow: "\x1b[33m",
	white: "\x1b[37m",
	bgBlue: "\x1b[44m",
	bgGreen: "\x1b[42m",
	bgRed: "\x1b[41m",
	bgMagenta: "\x1b[45m",
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

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
	return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

// Track timing
const phaseTimings = new Map<string, number>();
const agentTimings = new Map<string, number>();
let workflowStartTime: number | null = null;
let totalAgentsCompleted = 0;
const TOTAL_AGENTS = 11; // vision, analysis, identity, logo-guide, color, typography, tone, visual, design-standards, copywriting, applications

// Phase descriptions
const phaseDescriptions: Record<string, string> = {
	"logo-asset": "Logo Asset Processing",
	analysis: "Analysis Phase (Vision + Market)",
	identity: "Brand Identity Generation",
	guidelines: "Guidelines Generation (6 agents)",
	content: "Content Generation (2 agents)",
};

// Agent descriptions
const agentDescriptions: Record<string, string> = {
	vision: "Analyzing logo visual elements, colors, shapes, mood",
	analysis: "Analyzing market context, industry trends, audience insights",
	identity: "Generating brand philosophy, vision, personality, positioning",
	"logo-guide": "Creating logo usage guidelines and standards",
	color: "Designing color system and palette",
	typography: "Designing typography system",
	tone: "Defining voice and tone guidelines",
	visual: "Creating visual elements guide",
	"design-standards": "Creating design standards for packaging/signage",
	copywriting: "Generating brand copy and messaging",
	applications: "Creating application examples",
};

export function logWorkflowEvent(event: WorkflowEvent): void {
	const level = getLogLevel();
	if (level === "silent") return;

	const timestamp = formatTimestamp();
	const { reset, bright, dim, cyan, green, blue, red, yellow, white, bgBlue, bgGreen, bgRed } = colors;
	const now = Date.now();

	switch (event.type) {
		case "phase-start": {
			if (!workflowStartTime) {
				workflowStartTime = now;
				console.log("");
				console.log(`${bgBlue}${white}${bright} BRAND GUIDELINE WORKFLOW STARTED ${reset}`);
				console.log(`${dim}${"─".repeat(50)}${reset}`);
			}
			phaseTimings.set(event.phase, now);
			const desc = phaseDescriptions[event.phase] || event.phase;
			console.log("");
			console.log(`${dim}[${timestamp}]${reset} ${cyan}${bright}▶ PHASE: ${desc}${reset}`);
			console.log(`${dim}[${timestamp}]${reset} ${cyan}  └─ ${event.message}${reset}`);
			break;
		}

		case "phase-complete": {
			const startTime = phaseTimings.get(event.phase);
			const duration = startTime ? now - startTime : null;
			phaseTimings.delete(event.phase);

			const desc = phaseDescriptions[event.phase] || event.phase;
			const durationStr = duration ? ` (${formatDuration(duration)})` : "";
			console.log(`${dim}[${timestamp}]${reset} ${green}${bright}✓ PHASE COMPLETE: ${desc}${reset}${dim}${durationStr}${reset}`);
			break;
		}

		case "agent-start": {
			agentTimings.set(event.agent, now);
			const desc = agentDescriptions[event.agent] || "";
			console.log(`${dim}[${timestamp}]${reset} ${blue}  ┌─ Agent: ${bright}${event.agent}${reset}${blue} starting...${reset}`);
			if (desc) {
				console.log(`${dim}[${timestamp}]${reset} ${dim}  │  └─ ${desc}${reset}`);
			}
			break;
		}

		case "agent-complete": {
			const startTime = agentTimings.get(event.agent);
			const duration = startTime ? now - startTime : null;
			agentTimings.delete(event.agent);
			totalAgentsCompleted++;

			const durationStr = duration ? `${formatDuration(duration)}` : "";
			const progress = `[${totalAgentsCompleted}/${TOTAL_AGENTS}]`;
			console.log(
				`${dim}[${timestamp}]${reset} ${green}  └─ Agent: ${bright}${event.agent}${reset}${green} complete ${dim}${durationStr} ${yellow}${progress}${reset}`,
			);
			break;
		}

		case "complete": {
			const totalDuration = workflowStartTime ? now - workflowStartTime : null;
			const durationStr = totalDuration ? formatDuration(totalDuration) : "unknown";

			console.log("");
			console.log(`${dim}${"─".repeat(50)}${reset}`);
			console.log(`${bgGreen}${white}${bright} WORKFLOW COMPLETED SUCCESSFULLY ${reset}`);
			console.log("");
			console.log(`${dim}  Summary:${reset}`);
			console.log(`${dim}  ├─ Total Duration: ${reset}${bright}${durationStr}${reset}`);
			console.log(`${dim}  ├─ Agents Run: ${reset}${bright}${totalAgentsCompleted}${reset}`);
			console.log(`${dim}  ├─ Identity ID: ${reset}${dim}${event.data.identity.id}${reset}`);
			console.log(`${dim}  └─ Guideline ID: ${reset}${dim}${event.data.guideline.id}${reset}`);
			console.log("");

			// Reset counters
			workflowStartTime = null;
			totalAgentsCompleted = 0;
			break;
		}

		case "error": {
			const totalDuration = workflowStartTime ? now - workflowStartTime : null;
			const durationStr = totalDuration ? ` after ${formatDuration(totalDuration)}` : "";

			console.log("");
			console.log(`${dim}${"─".repeat(50)}${reset}`);
			console.error(`${bgRed}${white}${bright} WORKFLOW ERROR ${reset}${durationStr}`);
			console.error("");
			console.error(`${red}  Error: ${bright}${event.error}${reset}`);
			console.error(`${dim}  └─ Agents completed before error: ${totalAgentsCompleted}/${TOTAL_AGENTS}${reset}`);
			console.log("");

			// Reset counters
			workflowStartTime = null;
			totalAgentsCompleted = 0;
			break;
		}
	}
}
