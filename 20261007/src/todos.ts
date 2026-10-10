export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export class TodoStore {
  private readonly todos = new Map<number, Todo>();

  constructor(initialTodos: Todo[] = []) {
    for (const todo of initialTodos) {
      this.todos.set(todo.id, todo);
    }
  }

  delete(id: number): boolean {
    return this.todos.delete(id);
  }
}
