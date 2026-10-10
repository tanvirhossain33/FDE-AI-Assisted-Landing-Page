import type { IncomingMessage, ServerResponse } from "node:http";
import type { TodoStore } from "../todos";

function sendJson(
  response: ServerResponse,
  statusCode: number,
  payload: Record<string, string>,
): void {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

export function handleTodoRoutes(
  request: IncomingMessage,
  response: ServerResponse,
  store: TodoStore,
): boolean {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
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
