#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = process.cwd();
const intermediateDir = path.join(root, ".understand-anything", "intermediate");
const tmpDir = path.join(root, ".understand-anything", "tmp");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const scan = readJson(path.join(intermediateDir, "scan-result.json"));
const assembled = readJson(path.join(intermediateDir, "assembled-graph.json"));
const fileLevelTypes = new Set(["file", "config", "document", "service", "pipeline", "table", "schema", "resource", "endpoint"]);
const nodeIds = new Set(assembled.nodes.map((node) => node.id));
const fileLevelNodes = assembled.nodes.filter((node) => fileLevelTypes.has(node.type));

function layerFor(node) {
  const rel = node.filePath || node.id.replace(/^[^:]+:/, "");
  if (rel.startsWith("src/components/")) return "layer:interactive-ui-components";
  if (
    rel.startsWith("src/app/actions/") ||
    rel === "src/auth.ts" ||
    rel === "src/lib/auth.ts" ||
    rel === "src/proxy.ts" ||
    rel.includes("/api/auth/")
  ) return "layer:auth-and-server-actions";
  if (rel.startsWith("prisma/") || rel === "src/lib/prisma.ts" || rel.includes("migration")) return "layer:data-and-prisma";
  if (rel.startsWith("src/lib/")) return "layer:domain-training-logic";
  if (rel.startsWith("src/app/")) return "layer:nextjs-app-routes";
  if (rel === "src/app/globals.css") return "layer:nextjs-app-routes";
  return "layer:project-config-and-docs";
}

const layerDefinitions = {
  "layer:nextjs-app-routes": {
    id: "layer:nextjs-app-routes",
    name: "Next.js App Routes",
    description: "Pages, layouts, route handlers, and public app entry points that compose the Palace52 application experience.",
    nodeIds: [],
  },
  "layer:interactive-ui-components": {
    id: "layer:interactive-ui-components",
    name: "Interactive UI Components",
    description: "Reusable React components and client-side experiences for building palaces, playing modes, charts, shells, and forms.",
    nodeIds: [],
  },
  "layer:domain-training-logic": {
    id: "layer:domain-training-logic",
    name: "Domain Training Logic",
    description: "Shared libraries for deck generation, play modes, scoring, dashboard metrics, leaderboard ranking, PAO presets, and formatting.",
    nodeIds: [],
  },
  "layer:auth-and-server-actions": {
    id: "layer:auth-and-server-actions",
    name: "Auth And Server Actions",
    description: "Authentication integration and server actions that mutate account, palace, PAO, review, and training-session data.",
    nodeIds: [],
  },
  "layer:data-and-prisma": {
    id: "layer:data-and-prisma",
    name: "Data And Prisma",
    description: "Prisma client access, database schema definitions, and SQL migrations for persisted Palace52 state.",
    nodeIds: [],
  },
  "layer:project-config-and-docs": {
    id: "layer:project-config-and-docs",
    name: "Project Config And Docs",
    description: "Repository documentation, TypeScript and Next.js configuration, package manifests, and local development metadata.",
    nodeIds: [],
  },
};

for (const node of fileLevelNodes) {
  layerDefinitions[layerFor(node)].nodeIds.push(node.id);
}

const layers = Object.values(layerDefinitions).filter((layer) => layer.nodeIds.length > 0);

function tourStep(order, title, description, candidates) {
  return {
    order,
    title,
    description,
    nodeIds: candidates.filter((id) => nodeIds.has(id)).slice(0, 6),
  };
}

const tour = [
  tourStep(
    1,
    "Project Overview",
    "Start with the README and package manifest to understand what Palace52 is, how it runs locally, and which framework stack it uses.",
    ["document:README.md", "config:package.json", "config:next.config.ts"]
  ),
  tourStep(
    2,
    "Application Shell",
    "Follow the root layout into the public and authenticated shells to see how pages are wrapped, branded, and gated by login state.",
    ["file:src/app/layout.tsx", "file:src/components/app/public-shell.tsx", "file:src/app/(app)/layout.tsx", "file:src/components/app/app-shell.tsx"]
  ),
  tourStep(
    3,
    "Authentication And Profile",
    "Inspect the local auth helpers, NextAuth route, account actions, and profile page that show user identity and saved training history.",
    ["file:src/auth.ts", "file:src/lib/auth.ts", "file:src/app/api/auth/[...nextauth]/route.ts", "file:src/app/actions/auth-actions.ts", "file:src/app/(app)/profile/page.tsx"]
  ),
  tourStep(
    4,
    "Build Palaces And PAO Decks",
    "Walk through the builder route, client builder component, and persistence actions for custom routes and PAO card mappings.",
    ["file:src/app/build-palace/page.tsx", "file:src/components/build-palace/palace-builder.tsx", "file:src/app/actions/palaces.ts", "file:src/app/actions/card-images.ts", "file:src/lib/pao-decks.ts"]
  ),
  tourStep(
    5,
    "Play Modes And Session Saving",
    "Study how the play page prepares a mode, runs the interactive game, grades answers, and saves completed session results.",
    ["file:src/app/play/page.tsx", "file:src/components/play/play-game.tsx", "file:src/lib/play-modes.ts", "file:src/app/actions/sessions.ts", "file:src/lib/scoring.ts"]
  ),
  tourStep(
    6,
    "Dashboard And Leaderboard",
    "See how dashboard metrics, progress charts, and leaderboard rankings are calculated from completed training sessions.",
    ["file:src/app/(app)/dashboard/page.tsx", "file:src/lib/dashboard.ts", "file:src/lib/leaderboard.ts", "file:src/app/(app)/leaderboard/page.tsx", "file:src/components/app/progress-chart.tsx"]
  ),
  tourStep(
    7,
    "Database Model",
    "Finish at Prisma to connect the code paths back to persisted users, palaces, cards, sessions, reviews, and auth tables.",
    ["schema:prisma/schema.prisma", "schema:prisma/migrations/20260618090000_custom_credentials_auth/migration.sql", "file:src/lib/prisma.ts"]
  ),
].filter((step) => step.nodeIds.length > 0);

const gitCommitHash = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const fullGraph = {
  version: "1.0.0",
  project: {
    name: scan.name || scan.project?.name || "palace52",
    languages: scan.languages || scan.project?.languages || [],
    frameworks: scan.frameworks || scan.project?.frameworks || [],
    description: scan.description || scan.project?.description || "Palace52 codebase knowledge graph.",
    analyzedAt: new Date().toISOString(),
    gitCommitHash,
  },
  nodes: assembled.nodes,
  edges: assembled.edges,
  layers,
  tour,
};

const validationWarnings = [];
const assigned = new Map();
for (const layer of fullGraph.layers) {
  layer.nodeIds = layer.nodeIds.filter((id) => nodeIds.has(id));
  for (const id of layer.nodeIds) {
    if (assigned.has(id)) validationWarnings.push(`Node '${id}' appears in multiple layers`);
    assigned.set(id, layer.id);
  }
}
for (const node of fileLevelNodes) {
  if (!assigned.has(node.id)) {
    fullGraph.layers[fullGraph.layers.length - 1].nodeIds.push(node.id);
    assigned.set(node.id, fullGraph.layers[fullGraph.layers.length - 1].id);
  }
}
for (const step of fullGraph.tour) {
  step.nodeIds = step.nodeIds.filter((id) => nodeIds.has(id));
}

writeJson(path.join(intermediateDir, "layers.json"), fullGraph.layers);
writeJson(path.join(intermediateDir, "tour.json"), fullGraph.tour);
writeJson(path.join(intermediateDir, "assembled-graph.json"), fullGraph);
writeJson(path.join(intermediateDir, "assemble-review.json"), {
  warnings: validationWarnings,
  notes: ["Architecture layers and guided tour were generated from the merged graph and validated for existing node IDs."],
});

console.log(JSON.stringify({
  nodes: fullGraph.nodes.length,
  edges: fullGraph.edges.length,
  layers: fullGraph.layers.map((layer) => ({ name: layer.name, nodes: layer.nodeIds.length })),
  tourSteps: fullGraph.tour.length,
}, null, 2));
