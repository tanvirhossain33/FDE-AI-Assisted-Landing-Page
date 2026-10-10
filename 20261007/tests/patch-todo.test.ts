import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createTodoServer } from "../src/server";
import { TodoStore } from "../src/todos";

test("PATCH /todos/:id partially updates an existing todo", async () => {
  const server = createTodoServer(
    new TodoStore([{ id: 4, title: "Old title", completed: false }]),
  );

  server.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/todos/4`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New title" }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      id: 4,
      title: "New title",
      completed: false,
    });
  } finally {
    server.close();
    await once(server, "close");
  }
});

test("PATCH /todos/:id returns 404 when the todo does not exist", async () => {
  const server = createTodoServer(new TodoStore());

  server.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/todos/4`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "Todo not found" });
  } finally {
    server.close();
    await once(server, "close");
  }
});
