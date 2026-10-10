import type { IncomingMessage, ServerResponse } from "node:http";
import type { TodoStore } from "../todos";

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
  headers: Record<string, string> = {},
): void {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
    ...headers,
  });
  response.end(body);
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 1_000_000) {
      throw new Error("Request body is too large");
    }
    chunks.push(buffer);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function handleCreateTodo(
  request: IncomingMessage,
  response: ServerResponse,
  store: TodoStore,
): Promise<void> {
  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "Request body must be valid JSON" });
    return;
  }

  if (!isRecord(body) || typeof body.title !== "string") {
    sendJson(response, 400, { error: "Title is required" });
    return;
  }

  const title = body.title.trim();
  if (title.length === 0) {
    sendJson(response, 400, { error: "Title is required" });
    return;
  }

  if (body.completed !== undefined && typeof body.completed !== "boolean") {
    sendJson(response, 400, { error: "Completed must be a boolean" });
    return;
  }

  const todo = store.create(title, body.completed ?? false);
  sendJson(response, 201, todo, { Location: `/todos/${todo.id}` });
}

export async function handleTodoRoutes(
  request: IncomingMessage,
  response: ServerResponse,
  store: TodoStore,
): Promise<boolean> {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;

  if (request.method === "GET" && /^\/todos\/?$/.test(pathname)) {
    sendJson(response, 200, store.all());
    return true;
  }

  if (request.method === "POST" && /^\/todos\/?$/.test(pathname)) {
    await handleCreateTodo(request, response, store);
    return true;
  }

  const match = pathname.match(/^\/todos\/([^/]+)\/?$/);

  if (request.method !== "DELETE" || !match) {
    return false;
  }

  const id = Number(match[1]);
  if (!Number.isSafeInteger(id) || id < 1) {
    sendJson(response, 400, { error: "Todo id must be a positive integer" });
    return true;
  }

  if (!store.delete(id)) {
    sendJson(response, 404, { error: "Todo not found" });
    return true;
  }

  response.writeHead(204);
  response.end();
  return true;
}
