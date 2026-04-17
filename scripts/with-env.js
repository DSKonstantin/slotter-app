#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const VARIANT_ALIASES = {
  dev: "development",
  development: "development",
  staging: "staging",
  prod: "production",
  production: "production",
};

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) return acc;

      const key = match[1];
      let value = match[2];

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      acc[key] = value;
      return acc;
    }, {});
}

const [, , rawVariant, ...commandArgs] = process.argv;
const variant = VARIANT_ALIASES[rawVariant];

if (!variant || commandArgs.length === 0) {
  console.error(
    "Usage: node scripts/with-env.js <dev|staging|prod> <command> [args...]",
  );
  process.exit(1);
}

const cwd = process.cwd();
const envFileNames = [
  ".env",
  `.env.${variant}`,
  ".env.local",
  `.env.${variant}.local`,
];

const fileEnv = envFileNames.reduce((acc, fileName) => {
  const filePath = path.join(cwd, fileName);
  return { ...acc, ...parseEnvFile(filePath) };
}, {});

const env = {
  ...process.env,
  ...fileEnv,
  APP_VARIANT: fileEnv.APP_VARIANT || variant,
  EXPO_PUBLIC_APP_ENV: fileEnv.EXPO_PUBLIC_APP_ENV || variant,
};

const child = spawn(commandArgs[0], commandArgs.slice(1), {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

child.on("exit", (code) => process.exit(code ?? 0));
child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
