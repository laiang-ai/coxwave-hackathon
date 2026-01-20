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

// ============================================
// 요청별 컨텍스트 (동시 요청 시 로그 충돌 방지)
// ============================================
export interface WorkflowLogContext {
	id: string;
	phaseTimings: Map<string, number>;
	agentTimings: Map<string, number>;
	startTime: number | null;
	agentsCompleted: number;
}

const TOTAL_AGENTS = 11; // vision, analysis, identity, logo-guide, color, typography, tone, visual, design-standards, copywriting, applications

/**
 * 새로운 워크플로우 로그 컨텍스트 생성
 */
export function createLogContext(): WorkflowLogContext {
	return {
		id: crypto.randomUUID().slice(0, 8),
		phaseTimings: new Map(),
		agentTimings: new Map(),
		startTime: null,
		agentsCompleted: 0,
	};
}

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

/**
 * 워크플로우 이벤트 로깅 (요청별 컨텍스트 사용)
 * @param event 워크플로우 이벤트
 * @param ctx 선택적 로그 컨텍스트 (없으면 기본 동작)
 */
export function logWorkflowEvent(
	event: WorkflowEvent,
	ctx?: WorkflowLogContext,
): void {
	const level = getLogLevel();
	if (level === "silent") return;

	const timestamp = formatTimestamp();
	const {
		reset,
		bright,
		dim,
		cyan,
		green,
		blue,
		red,
		yellow,
		white,
		bgBlue,
		bgGreen,
		bgRed,
	} = colors;
	const now = Date.now();

	// 컨텍스트 ID 프리픽스 (있는 경우)
	const ctxPrefix = ctx ? `${dim}[${ctx.id}]${reset} ` : "";

	switch (event.type) {
		case "phase-start": {
			if (ctx) {
				if (!ctx.startTime) {
					ctx.startTime = now;
					console.log("");
					console.log(
						`${ctxPrefix}${bgBlue}${white}${bright} BRAND GUIDELINE WORKFLOW STARTED ${reset}`,
					);
					console.log(`${ctxPrefix}${dim}${"─".repeat(50)}${reset}`);
				}
				ctx.phaseTimings.set(event.phase, now);
			}
			const desc = phaseDescriptions[event.phase] || event.phase;
			console.log("");
			console.log(
				`${ctxPrefix}${dim}[${timestamp}]${reset} ${cyan}${bright}▶ PHASE: ${desc}${reset}`,
			);
			console.log(
				`${ctxPrefix}${dim}[${timestamp}]${reset} ${cyan}  └─ ${event.message}${reset}`,
			);
			break;
		}

		case "phase-complete": {
			const startTime = ctx?.phaseTimings.get(event.phase);
			const duration = startTime ? now - startTime : null;
			ctx?.phaseTimings.delete(event.phase);

			const desc = phaseDescriptions[event.phase] || event.phase;
			const durationStr = duration ? ` (${formatDuration(duration)})` : "";
			console.log(
				`${ctxPrefix}${dim}[${timestamp}]${reset} ${green}${bright}✓ PHASE COMPLETE: ${desc}${reset}${dim}${durationStr}${reset}`,
			);
			break;
		}

		case "agent-start": {
			ctx?.agentTimings.set(event.agent, now);
			const desc = agentDescriptions[event.agent] || "";
			console.log(
				`${ctxPrefix}${dim}[${timestamp}]${reset} ${blue}  ┌─ Agent: ${bright}${event.agent}${reset}${blue} starting...${reset}`,
			);
			if (desc) {
				console.log(
					`${ctxPrefix}${dim}[${timestamp}]${reset} ${dim}  │  └─ ${desc}${reset}`,
				);
			}
			break;
		}

		case "agent-complete": {
			const startTime = ctx?.agentTimings.get(event.agent);
			const duration = startTime ? now - startTime : null;
			ctx?.agentTimings.delete(event.agent);
			if (ctx) {
				ctx.agentsCompleted++;
			}

			const durationStr = duration ? `${formatDuration(duration)}` : "";
			const progress = ctx ? `[${ctx.agentsCompleted}/${TOTAL_AGENTS}]` : "";
			console.log(
				`${ctxPrefix}${dim}[${timestamp}]${reset} ${green}  └─ Agent: ${bright}${event.agent}${reset}${green} complete ${dim}${durationStr} ${yellow}${progress}${reset}`,
			);
			break;
		}

		case "complete": {
			const totalDuration = ctx?.startTime ? now - ctx.startTime : null;
			const durationStr = totalDuration
				? formatDuration(totalDuration)
				: "unknown";
			const agentsRun = ctx?.agentsCompleted ?? "unknown";

			// 방어적 체크 - event.data가 undefined일 수 있음
			const identityId = event.data?.identity?.id ?? "unknown";
			const guidelineId = event.data?.guideline?.id ?? "unknown";

			console.log("");
			console.log(`${ctxPrefix}${dim}${"─".repeat(50)}${reset}`);
			console.log(
				`${ctxPrefix}${bgGreen}${white}${bright} WORKFLOW COMPLETED SUCCESSFULLY ${reset}`,
			);
			console.log("");
			console.log(`${ctxPrefix}${dim}  Summary:${reset}`);
			console.log(
				`${ctxPrefix}${dim}  ├─ Total Duration: ${reset}${bright}${durationStr}${reset}`,
			);
			console.log(
				`${ctxPrefix}${dim}  ├─ Agents Run: ${reset}${bright}${agentsRun}${reset}`,
			);
			console.log(
				`${ctxPrefix}${dim}  ├─ Identity ID: ${reset}${dim}${identityId}${reset}`,
			);
			console.log(
				`${ctxPrefix}${dim}  └─ Guideline ID: ${reset}${dim}${guidelineId}${reset}`,
			);
			console.log("");

			// 컨텍스트 리셋
			if (ctx) {
				ctx.startTime = null;
				ctx.agentsCompleted = 0;
				ctx.phaseTimings.clear();
				ctx.agentTimings.clear();
			}
			break;
		}

		case "error": {
			const totalDuration = ctx?.startTime ? now - ctx.startTime : null;
			const durationStr = totalDuration
				? ` after ${formatDuration(totalDuration)}`
				: "";
			const agentsCompleted = ctx?.agentsCompleted ?? 0;

			console.log("");
			console.log(`${ctxPrefix}${dim}${"─".repeat(50)}${reset}`);
			console.error(
				`${ctxPrefix}${bgRed}${white}${bright} WORKFLOW ERROR ${reset}${durationStr}`,
			);
			console.error("");
			console.error(
				`${ctxPrefix}${red}  Error: ${bright}${event.error}${reset}`,
			);
			console.error(
				`${ctxPrefix}${dim}  └─ Agents completed before error: ${agentsCompleted}/${TOTAL_AGENTS}${reset}`,
			);
			console.log("");

			// 컨텍스트 리셋
			if (ctx) {
				ctx.startTime = null;
				ctx.agentsCompleted = 0;
				ctx.phaseTimings.clear();
				ctx.agentTimings.clear();
			}
			break;
		}
	}
}

/**
 * 검증 오류 항목 타입
 */
export interface ValidationIssue {
	path: PropertyKey[];
	message: string;
}

function formatSummaryValue(value: unknown): string {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean")
		return String(value);
	return JSON.stringify(value ?? null);
}

/**
 * 생성된 데이터 로깅
 * @param ctx 로그 컨텍스트
 * @param label 데이터 라벨 (예: "Vision Analysis", "Identity Model")
 * @param data 로깅할 데이터
 * @param summary 요약 정보 (선택적) - 전체 데이터 대신 핵심 정보만 표시할 때 사용
 */
export function logGeneratedData(
	ctx: WorkflowLogContext,
	label: string,
	data: unknown,
	summary?: Record<string, unknown>,
): void {
	const level = getLogLevel();
	if (level === "silent") return;

	const timestamp = formatTimestamp();
	const { reset, dim, magenta, bright, cyan } = colors;
	const ctxPrefix = `${dim}[${ctx.id}]${reset} `;

	console.log("");
	console.log(
		`${ctxPrefix}${dim}[${timestamp}]${reset} ${magenta}${bright}📦 GENERATED DATA: ${label}${reset}`,
	);

	// 요약 정보가 있으면 요약만 출력
	if (summary) {
		for (const [key, value] of Object.entries(summary)) {
			const displayValue = formatSummaryValue(value);
			console.log(
				`${ctxPrefix}${dim}  ├─ ${cyan}${key}:${reset} ${displayValue}`,
			);
		}
	}

	// debug 모드일 때만 전체 데이터 출력
	if (level === "debug") {
		console.log(`${ctxPrefix}${dim}  └─ Full data:${reset}`);
		console.log(
			JSON.stringify(data, null, 2)
				.split("\n")
				.map((line) => `${ctxPrefix}${dim}     ${line}${reset}`)
				.join("\n"),
		);
	}
}

/**
 * 스키마 검증 오류 로깅
 */
export function logValidationError(
	ctx: WorkflowLogContext,
	schemaName: string,
	errors: ValidationIssue[],
	attempt: number,
	willRetry: boolean,
): void {
	const level = getLogLevel();
	if (level === "silent") return;

	const timestamp = formatTimestamp();
	const { reset, dim, yellow, red, bright } = colors;
	const ctxPrefix = `${dim}[${ctx.id}]${reset} `;

	console.log("");
	console.log(
		`${ctxPrefix}${dim}[${timestamp}]${reset} ${yellow}${bright}⚠ VALIDATION ERROR${reset} (attempt ${attempt + 1})`,
	);
	console.log(`${ctxPrefix}${dim}  └─ Schema: ${schemaName}${reset}`);

	for (const issue of errors) {
		const path = issue.path.join(".") || "(root)";
		console.log(`${ctxPrefix}${red}  └─ ${path}: ${issue.message}${reset}`);
	}

	if (willRetry) {
		console.log(`${ctxPrefix}${yellow}  ↻ 에이전트 재실행 중...${reset}`);
	}
}
