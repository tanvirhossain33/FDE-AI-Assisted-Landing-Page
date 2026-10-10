export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export class TodoStore {
  private readonly todos = new Map<number, Todo>();
  private nextId = 1;

  constructor(initialTodos: Todo[] = []) {
    for (const todo of initialTodos) {
      this.todos.set(todo.id, todo);
      this.nextId = Math.max(this.nextId, todo.id + 1);
    }
  }

  create(title: string, completed = false): Todo {
    const todo: Todo = { id: this.nextId, title, completed };
    this.todos.set(todo.id, todo);
    this.nextId += 1;
    return todo;
  }

  all(): Todo[] {
    return [...this.todos.values()];
  }

  delete(id: number): boolean {
    return this.todos.delete(id);
  }
}
