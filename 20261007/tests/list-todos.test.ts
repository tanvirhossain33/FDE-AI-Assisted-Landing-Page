import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createTodoServer } from "../src/server";
import { TodoStore } from "../src/todos";

test("GET /todos returns all todos", async () => {
  const server = createTodoServer(
    new TodoStore([
      { id: 1, title: "Buy milk", completed: false },
      { id: 2, title: "Write tests", completed: true },
    ]),
  );

  server.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/todos`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [
      { id: 1, title: "Buy milk", completed: false },
      { id: 2, title: "Write tests", completed: true },
    ]);
  } finally {
    server.close();
    await once(server, "close");
  }
});

test("GET /todos returns an empty array when there are no todos", async () => {
  const server = createTodoServer(new TodoStore());

  server.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${port}/todos`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
  } finally {
    server.close();
    await once(server, "close");
  }
});
