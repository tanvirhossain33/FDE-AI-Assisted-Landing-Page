import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createTodoServer } from "../src/server";
import { TodoStore } from "../src/todos";

test("POST /todos creates a todo", async () => {
  const server = createTodoServer(new TodoStore());

  server.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Write tests", completed: true }),
    });

    assert.equal(response.status, 201);
    assert.equal(response.headers.get("location"), "/todos/1");
    assert.deepEqual(await response.json(), {
      id: 1,
      title: "Write tests",
      completed: true,
    });
  } finally {
    server.close();
    await once(server, "close");
  }
});

test("POST /todos rejects a todo without a title", async () => {
  const server = createTodoServer(new TodoStore());

  server.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: false }),
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Title is required" });
  } finally {
    server.close();
    await once(server, "close");
  }
});
