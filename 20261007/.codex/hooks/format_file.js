
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const supported = new Set([
  ".ts", ".tsx", ".js", ".jsx",
  ".json", ".css", ".scss",
  ".html", ".md", ".yaml", ".yml"
]);

let input = "";

process.stdin.setEncoding("utf8");

process.stdin.on("data", chunk => {
  input += chunk;
});

process.stdin.on("end", () => {
  try {
    const event = JSON.parse(input);

    if (event.tool_name !== "apply_patch") return;

    const patch = event.tool_input?.command || "";
    const root = path.resolve(event.cwd || process.cwd());

    const regex = /^\*\*\* (?:Add|Update) File: (.+)$/gm;
    const files = new Set();

    for (const match of patch.matchAll(regex)) {
      files.add(match[1].trim());
    }

    for (const name of files) {
      const file = path.resolve(root, name);
      const relative = path.relative(root, file);

      // Prevent formatting files outside the project
      if (
        relative === ".." ||
        relative.startsWith(".." + path.sep) ||
        path.isAbsolute(relative)
      ) continue;

      if (!fs.existsSync(file)) continue;
      if (!fs.statSync(file).isFile()) continue;
      if (!supported.has(path.extname(file).toLowerCase())) {
        continue;
      }

      const result = spawnSync(
        process.platform === "win32" ? "npm.cmd" : "npm",
        ["exec", "--no", "--", "prettier", "--write", file],
        {
          cwd: root,
          stdio: "inherit",
          shell: process.platform === "win32"
        }
      );

      if (result.status !== 0) {
        console.error(`Prettier failed: ${name}`);
        process.exitCode = 1;
      }
    }
  } catch (error) {
    console.error("Hook error:", error.message);
    process.exitCode = 1;
  }
});
