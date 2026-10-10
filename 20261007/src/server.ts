import { createServer, type Server } from "node:http";
import { handleTodoRoutes } from "./routes/todos";
import { TodoStore } from "./todos";

export function createTodoServer(store = new TodoStore()): Server {
  return createServer((request, response) => {
    if (handleTodoRoutes(request, response, store)) {
      return;
    }

    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Route not found" }));
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3000);
  createTodoServer().listen(port, () => {
    console.log(`Todo API listening on port ${port}`);
  });
}
