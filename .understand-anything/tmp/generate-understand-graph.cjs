#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const projectRoot = process.cwd();
const skillDir = "/Users/kevin/.understand-anything/repo/understand-anything-plugin/skills/understand";
const intermediateDir = path.join(projectRoot, ".understand-anything", "intermediate");
const tmpDir = path.join(projectRoot, ".understand-anything", "tmp");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const exists = (rel) => fs.existsSync(path.join(projectRoot, rel));
const slug = (value) => String(value || "unknown").replace(/[^A-Za-z0-9_$.-]+/g, "_");
const unique = (items) => [...new Set(items.filter(Boolean))];

const scan = readJson(path.join(intermediateDir, "scan-result.json"));
const batchesFile = readJson(path.join(intermediateDir, "batches.json"));
const allFiles = scan.files || [];
const fileByPath = new Map(allFiles.map((file) => [file.path, file]));
const allImportMap = scan.importMap || {};
const exportMap = batchesFile.exportsByPath || {};
const knownFileIds = new Map();

function fileNodeType(file) {
  const rel = file.path;
  if (file.fileCategory === "docs" || /\.(md|mdx|rst|txt)$/i.test(rel)) return "document";
  if (file.fileCategory === "config" || /\.(json|ya?ml|toml|mjs|env|config\.ts)$/i.test(rel) || rel.includes("config")) return "config";
  if (file.fileCategory === "infra") {
    if (rel.includes("workflow") || rel.includes(".github")) return "pipeline";
    if (/Dockerfile|compose|service/i.test(rel)) return "service";
    return "resource";
  }
  if (file.fileCategory === "data") {
    if (/schema\.prisma$|\.graphql$|\.gql$|\.proto$/i.test(rel)) return "schema";
    if (/migration\.sql$/i.test(rel)) return "schema";
    return "schema";
  }
  return "file";
}

function nodePrefix(type) {
  return {
    file: "file",
    config: "config",
    document: "document",
    service: "service",
    pipeline: "pipeline",
    table: "table",
    schema: "schema",
    resource: "resource",
    endpoint: "endpoint",
  }[type] || "file";
}

function fileNodeId(file) {
  const type = fileNodeType(file);
  return `${nodePrefix(type)}:${file.path}`;
}

for (const file of allFiles) {
  knownFileIds.set(file.path, fileNodeId(file));
}

function tagsFor(file) {
  const rel = file.path;
  const tags = [file.fileCategory, file.language];
  if (rel.startsWith("src/app/")) tags.push("next-app-router");
  if (rel.includes("/actions/")) tags.push("server-actions");
  if (rel.startsWith("src/components/")) tags.push("react-component");
  if (rel.startsWith("src/lib/")) tags.push("domain-library");
  if (rel.includes("auth")) tags.push("auth");
  if (rel.includes("leaderboard")) tags.push("leaderboard");
  if (rel.includes("dashboard")) tags.push("dashboard");
  if (rel.includes("play") || rel.includes("training") || rel.includes("sessions")) tags.push("training");
  if (rel.includes("palace") || rel.includes("pao")) tags.push("memory-palace");
  if (rel.startsWith("prisma/")) tags.push("database");
  if (rel.startsWith("docs/")) tags.push("documentation");
  return unique(tags.map((tag) => String(tag).toLowerCase().replace(/[^a-z0-9]+/g, "-")).filter((tag) => tag && tag !== "unknown")).slice(0, 6);
}

function complexityFor(lines = 0) {
  if (lines > 220) return "complex";
  if (lines > 70) return "moderate";
  return "simple";
}

function displayName(filePath) {
  const base = path.basename(filePath);
  if (base === "page.tsx") {
    const parts = filePath.split("/");
    return `${parts.slice(-3, -1).join("/") || "page"} page`;
  }
  if (base === "route.ts") {
    const parts = filePath.split("/");
    return `${parts.slice(-4, -1).join("/") || "api"} route`;
  }
  return base;
}

function summaryFor(file, structure) {
  const rel = file.path;
  if (rel === "README.md") return "Project README describing Palace52 setup, local development, authentication, and core memory-training workflows.";
  if (rel === "package.json") return "Project manifest defining the Next.js application scripts and dependencies for the Palace52 web app.";
  if (rel === "prisma/schema.prisma") return "Prisma data model for users, palaces, PAO card images, training sessions, reviews, and authentication records.";
  if (rel === "src/app/layout.tsx") return "Root Next.js layout that loads global styles and wraps the application with session and shell providers.";
  if (rel === "src/app/page.tsx") return "Public home page presenting Palace52 and directing visitors into account creation or training guidance.";
  if (rel.includes("/dashboard/page.tsx")) return "Authenticated dashboard page that gathers user training stats, reviews, progress charts, and leaderboard preview data.";
  if (rel.includes("/profile/page.tsx")) return "Profile page that summarizes user identity, training history, performance metrics, and clear-history controls.";
  if (rel === "src/components/play/play-game.tsx") return "Client play experience for memorizing and recalling card sequences across the supported training modes.";
  if (rel === "src/components/build-palace/palace-builder.tsx") return "Client builder for creating editable palace routes and custom PAO deck entries.";
  if (rel === "src/lib/play-modes.ts") return "Domain logic for preparing play-mode decks, grading answers, normalizing card codes, and producing session results.";
  if (rel === "src/lib/leaderboard.ts") return "Leaderboard query logic that ranks completed eligible sessions by score, accuracy, and time.";
  if (rel === "src/app/actions/sessions.ts") return "Server actions for creating, completing, saving, and clearing user training session history.";
  if (rel.startsWith("docs/")) return `Documentation covering ${displayName(rel).replace(/\.(md|mdx)$/i, "")} for the Palace52 project.`;
  if (fileNodeType(file) === "config") return `Configuration file for ${displayName(rel)} in the Palace52 Next.js project.`;
  if (fileNodeType(file) === "schema") return `Database or schema artifact used by the Palace52 persistence layer.`;
  const exports = structure?.exports?.map((item) => item.name).filter(Boolean) || exportMap[rel] || [];
  if (rel.startsWith("src/app/")) return `Next.js route module for ${rel.replace(/^src\/app\//, "")}, exporting ${exports.slice(0, 3).join(", ") || "route UI or handlers"}.`;
  if (rel.startsWith("src/components/")) return `React component module for Palace52 UI, exporting ${exports.slice(0, 3).join(", ") || "component helpers"}.`;
  if (rel.startsWith("src/lib/")) return `Shared Palace52 library module for ${displayName(rel).replace(/\.(ts|tsx|mjs)$/i, "")} behavior.`;
  return `${displayName(rel)} in the Palace52 codebase.`;
}

function makeEdge(source, target, type, weight = 0.5) {
  return { source, target, type, direction: "forward", weight };
}

function targetFunctionId(filePath, name) {
  return `function:${filePath}:${slug(name)}`;
}

function findFunctionNodeByName(nodes, name) {
  const suffix = `:${slug(name)}`;
  return nodes.find((node) => node.id.endsWith(suffix) && node.type === "function");
}

function analyzeBatch(batch) {
  const inputPath = path.join(tmpDir, `ua-file-analyzer-input-${batch.batchIndex}.json`);
  const structurePath = path.join(tmpDir, `ua-structure-${batch.batchIndex}.json`);
  writeJson(inputPath, {
    projectRoot,
    batchFiles: batch.files.map((file) => ({
      path: file.path,
      language: file.language,
      sizeLines: file.sizeLines,
      fileCategory: file.fileCategory,
    })),
    batchImportData: batch.batchImportData,
  });
  execFileSync("node", [path.join(skillDir, "extract-structure.mjs"), inputPath, structurePath], {
    cwd: projectRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const structure = readJson(structurePath);
  const byPath = new Map((structure.results || []).map((result) => [result.path, result]));
  const nodes = [];
  const edges = [];

  for (const file of batch.files) {
    const fileId = fileNodeId(file);
    const fileType = fileNodeType(file);
    const result = byPath.get(file.path);
    nodes.push({
      id: fileId,
      type: fileType,
      name: displayName(file.path),
      summary: summaryFor(file, result),
      tags: tagsFor(file),
      complexity: complexityFor(result?.nonEmptyLines || file.sizeLines),
      filePath: file.path,
      language: file.language,
    });

    for (const target of batch.batchImportData[file.path] || []) {
      const targetId = knownFileIds.get(target) || `file:${target}`;
      edges.push(makeEdge(fileId, targetId, "imports", 0.7));
    }

    for (const fn of result?.functions || []) {
      const lineCount = (fn.endLine || fn.startLine || 0) - (fn.startLine || 0) + 1;
      const isExported = (result.exports || []).some((exp) => exp.name === fn.name);
      if (!isExported && lineCount < 10) continue;
      const fnId = targetFunctionId(file.path, fn.name);
      nodes.push({
        id: fnId,
        type: "function",
        name: fn.name,
        summary: `${fn.name} implements ${displayName(file.path)} behavior in ${file.path}.`,
        tags: unique([...tagsFor(file), isExported ? "exported" : "internal"]).slice(0, 7),
        complexity: complexityFor(lineCount),
        filePath: file.path,
        lineRange: { start: fn.startLine || 1, end: fn.endLine || fn.startLine || 1 },
      });
      edges.push(makeEdge(fileId, fnId, "contains", 1.0));
      if (isExported) edges.push(makeEdge(fileId, fnId, "exports", 0.8));
    }

    for (const cls of result?.classes || []) {
      const lineCount = (cls.endLine || cls.startLine || 0) - (cls.startLine || 0) + 1;
      const methods = cls.methods?.length || 0;
      if (lineCount < 20 && methods < 2) continue;
      const clsId = `class:${file.path}:${slug(cls.name)}`;
      nodes.push({
        id: clsId,
        type: "class",
        name: cls.name,
        summary: `${cls.name} groups ${displayName(file.path)} behavior.`,
        tags: unique([...tagsFor(file), "class"]).slice(0, 7),
        complexity: complexityFor(lineCount),
        filePath: file.path,
        lineRange: { start: cls.startLine || 1, end: cls.endLine || cls.startLine || 1 },
      });
      edges.push(makeEdge(fileId, clsId, "contains", 1.0));
    }
  }

  const localNodes = new Map(nodes.map((node) => [node.id, node]));
  for (const result of structure.results || []) {
    for (const call of result.callGraph || []) {
      const caller = findFunctionNodeByName(nodes.filter((node) => node.filePath === result.path), call.caller);
      if (!caller) continue;
      const imports = batch.batchImportData[result.path] || allImportMap[result.path] || [];
      let targetId = null;
      for (const importedFile of imports) {
        if ((exportMap[importedFile] || []).includes(call.callee)) {
          targetId = targetFunctionId(importedFile, call.callee);
          break;
        }
      }
      if (targetId && localNodes.has(targetId)) edges.push(makeEdge(caller.id, targetId, "calls", 0.8));
    }
  }

  for (const file of batch.files) {
    const sourceId = fileNodeId(file);
    if (file.path === "prisma/schema.prisma" && exists("src/lib/prisma.ts")) {
      edges.push(makeEdge(sourceId, knownFileIds.get("src/lib/prisma.ts"), "defines_schema", 0.8));
    }
    if (file.path === "src/lib/prisma.ts" && exists("prisma/schema.prisma")) {
      edges.push(makeEdge(sourceId, knownFileIds.get("prisma/schema.prisma"), "depends_on", 0.6));
    }
    if (file.path === "package.json" && exists("next.config.ts")) {
      edges.push(makeEdge(sourceId, knownFileIds.get("next.config.ts"), "configures", 0.6));
    }
    if (file.path === "README.md" && exists("src/app/page.tsx")) {
      edges.push(makeEdge(sourceId, knownFileIds.get("src/app/page.tsx"), "documents", 0.5));
    }
    if (file.path.startsWith("docs/")) {
      const docsTarget = file.path.includes("AUTH") && exists("src/auth.ts")
        ? "src/auth.ts"
        : file.path.includes("game") && exists("src/lib/play-modes.ts")
          ? "src/lib/play-modes.ts"
          : exists("src/app/page.tsx")
            ? "src/app/page.tsx"
            : null;
      if (docsTarget) edges.push(makeEdge(sourceId, knownFileIds.get(docsTarget), "documents", 0.5));
    }
  }

  const seenEdges = new Set();
  const dedupedEdges = edges.filter((edge) => {
    const key = `${edge.source}|${edge.target}|${edge.type}`;
    if (seenEdges.has(key)) return false;
    seenEdges.add(key);
    return true;
  });
  writeJson(path.join(intermediateDir, `batch-${batch.batchIndex}.json`), { nodes, edges: dedupedEdges });
  return { batchIndex: batch.batchIndex, files: batch.files.length, nodes: nodes.length, edges: dedupedEdges.length };
}

const results = [];
for (const batch of batchesFile.batches || []) {
  const names = batch.files.slice(0, 3).map((file) => file.path).join(", ");
  console.error(`Analyzing batch ${batch.batchIndex}/${batchesFile.totalBatches} (${names}${batch.files.length > 3 ? ", ..." : ""})`);
  results.push(analyzeBatch(batch));
}

console.log(JSON.stringify({ batches: results }, null, 2));
