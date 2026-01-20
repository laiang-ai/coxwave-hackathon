#!/usr/bin/env node
import fs from "fs";
import path from "path";

const [idArg, ...nameParts] = process.argv.slice(2);

if (!idArg) {
	console.log("Usage: node scripts/create-agent.mjs <agent-id> [Display Name]");
	process.exit(1);
}

const id = idArg.trim();
const displayName = nameParts.join(" ").trim() || toTitleCase(id);
const root = process.cwd();
const varName = toSafeCamelCase(id);
const pascalName = toPascalCase(id);
const agentDir = path.join(root, "lib", "agents", "agents", id);

if (fs.existsSync(agentDir)) {
	console.error(`Agent folder already exists: ${agentDir}`);
	process.exit(1);
}

fs.mkdirSync(agentDir, { recursive: true });

const config = `import { Agent } from "@openai/agents";\nimport type { AgentConfiguration } from "@openai/agents";\nimport { ${varName}Tools } from "./tools";\n\nexport const ${varName}Config: AgentConfiguration = {\n  name: "${displayName}",\n  instructions: "TODO: describe this agent's behavior.",\n  model: "gpt-4.1-mini",\n  modelSettings: {\n    temperature: 0.4,\n  },\n  tools: ${varName}Tools,\n};\n\nexport const create${pascalName}Agent = (\n  overrides: Partial<AgentConfiguration> = {},\n) => new Agent({ ...${varName}Config, ...overrides });\n`;

const tools = `import { sharedTools } from "@/lib/agents/tools";\n\nexport const ${varName}Tools = [...sharedTools];\n`;
const index = `export { create${pascalName}Agent, ${varName}Config } from "./config";\nexport { ${varName}Tools } from "./tools";\n`;

fs.writeFileSync(path.join(agentDir, "config.ts"), config, "utf8");
fs.writeFileSync(path.join(agentDir, "tools.ts"), tools, "utf8");
fs.writeFileSync(path.join(agentDir, "index.ts"), index, "utf8");

updateRegistry({ id });

console.log(`Created agent '${id}' in ${agentDir}`);

function updateRegistry({ id }) {
	const registryPath = path.join(root, "lib", "agents", "registry.ts");
	const contents = fs.readFileSync(registryPath, "utf8");

	const importLine = `import { create${pascalName}Agent } from "./agents/${id}";`;
	let next = insertBetweenMarkers(
		contents,
		"// AGENT_IMPORTS_START",
		"// AGENT_IMPORTS_END",
		importLine,
	);

	next = insertBetweenMarkers(
		next,
		"// AGENT_ID_START",
		"// AGENT_ID_END",
		`"${id}",`,
	);

	next = insertBetweenMarkers(
		next,
		"// AGENT_REGISTRY_START",
		"// AGENT_REGISTRY_END",
		`${id}: create${pascalName}Agent,`,
	);

	fs.writeFileSync(registryPath, next, "utf8");
}

function insertBetweenMarkers(source, startMarker, endMarker, line) {
	const startIndex = source.indexOf(startMarker);
	const endIndex = source.indexOf(endMarker);
	if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
		throw new Error(`Marker not found: ${startMarker} / ${endMarker}`);
	}

	const before = source.slice(0, startIndex + startMarker.length);
	const between = source.slice(startIndex + startMarker.length, endIndex);
	const after = source.slice(endIndex);

	if (between.includes(line)) {
		return source;
	}

	const indentation = between.match(/\n(\s*)[^\n]*$/)?.[1] ?? "\t";
	const insertion = `\n${indentation}${line}`;
	return `${before}${between}${insertion}${after}`;
}

function toPascalCase(value) {
	return value
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.trim()
		.split(" ")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

function toTitleCase(value) {
	return value
		.replace(/[-_]/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

function toSafeCamelCase(value) {
	const camel = value
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.trim()
		.split(" ")
		.map((part, index) =>
			index === 0
				? part.charAt(0).toLowerCase() + part.slice(1)
				: part.charAt(0).toUpperCase() + part.slice(1),
		)
		.join("");

	if (!camel || /^[0-9]/.test(camel)) {
		return `agent${camel ? camel.charAt(0).toUpperCase() + camel.slice(1) : ""}`;
	}
	return camel;
}
