import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ProviderError } from "../errors.js";
import type { AIProvider, ProviderRequest } from "./types.js";

const ALLOWED_CODEX_MODELS = ["gpt-5.4-mini"] as const;
const MAX_OUTPUT_BYTES = 32_768;

export interface CommandRunOptions {
  file: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
  timeoutMs: number;
  maxOutputBytes: number;
  input: string;
}

export interface CommandRunner {
  run(options: CommandRunOptions): Promise<{ stdout: string }>;
}

export class NodeExecFileRunner implements CommandRunner {
  public async run(options: CommandRunOptions): Promise<{ stdout: string }> {
    return new Promise((resolve, reject) => {
      const child = execFile(
        options.file,
        options.args,
        {
          cwd: options.cwd,
          env: options.env,
          encoding: "utf8",
          timeout: options.timeoutMs,
          maxBuffer: options.maxOutputBytes,
          killSignal: "SIGTERM",
          windowsHide: true
        },
        (error, stdout) => {
          if (error) {
            const code = error.killed ? "AI_TIMEOUT" : "AI_UNAVAILABLE";
            reject(new ProviderError(code));
            return;
          }

          resolve({ stdout });
        }
      );

      child.stdin?.on("error", () => undefined);
      child.stdin?.end(options.input, "utf8");
    });
  }
}

export interface CodexProviderOptions {
  model: string;
  apiKey?: string;
  workdir: string;
  timeoutMs: number;
  executable?: string;
}

function coachSchemaPath(): string {
  return fileURLToPath(new URL("./schemas/coach.schema.json", import.meta.url));
}

function parseStructuredOutput(stdout: string): unknown {
  try {
    return JSON.parse(stdout.trim());
  } catch {
    throw new ProviderError("AI_RESPONSE_INVALID");
  }
}

/**
 * Executes only a backend-owned, fixed Codex CLI command. Student input is passed
 * through stdin and can never modify the executable or any CLI argument.
 */
export class CodexProvider implements AIProvider {
  private readonly executable: string;

  public constructor(
    private readonly options: CodexProviderOptions,
    private readonly runner: CommandRunner = new NodeExecFileRunner()
  ) {
    if (!ALLOWED_CODEX_MODELS.includes(options.model as (typeof ALLOWED_CODEX_MODELS)[number])) {
      throw new Error("CODEX_MODEL 不在後端 allowlist 中。");
    }
    this.executable = options.executable ?? "codex";
  }

  public async generate(request: ProviderRequest): Promise<unknown> {
    await mkdir(this.options.workdir, { recursive: true });

    const result = await this.runner.run({
      file: this.executable,
      args: [
        "exec",
        "--model",
        this.options.model,
        "--sandbox",
        "read-only",
        "--ephemeral",
        "--ignore-user-config",
        "--ignore-rules",
        "--skip-git-repo-check",
        "--cd",
        this.options.workdir,
        "--output-schema",
        coachSchemaPath(),
        "--color",
        "never",
        "-"
      ],
      cwd: this.options.workdir,
      env: {
        PATH: process.env.PATH ?? "",
        HOME: process.env.HOME ?? "",
        ...(process.env.CODEX_HOME ? { CODEX_HOME: process.env.CODEX_HOME } : {}),
        ...(this.options.apiKey ? { CODEX_API_KEY: this.options.apiKey } : {}),
        RUST_LOG: "error"
      },
      timeoutMs: this.options.timeoutMs,
      maxOutputBytes: MAX_OUTPUT_BYTES,
      input: request.prompt
    });

    return parseStructuredOutput(result.stdout);
  }
}
