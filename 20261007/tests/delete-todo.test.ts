import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createTodoServer } from "../src/server";
import { TodoStore } from "../src/todos";

test("DELETE /todos/:id deletes an existing todo", async () => {
  const server = createTodoServer(
    new TodoStore([{ id: 1, title: "Buy milk", completed: false }]),
  );

  server.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/todos/1`, {
      method: "DELETE",
    });

    assert.equal(response.status, 204);

    const secondResponse = await fetch(`http://127.0.0.1:${port}/todos/1`, {
      method: "DELETE",
    });

    assert.equal(secondResponse.status, 404);
  } finally {
    server.close();
    await once(server, "close");
  }
});

test("DELETE /todos/:id returns 404 when the todo does not exist", async () => {
  const server = createTodoServer(new TodoStore());

  server.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/todos/99`, {
      method: "DELETE",
    });

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "Todo not found" });
  } finally {
    server.close();
    await once(server, "close");
  }
});
