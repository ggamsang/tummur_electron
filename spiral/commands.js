export function getTodos() {
  return window.electronAPI.getTodos().then((response) => {
    if (response.status === 200) {
      const todos = response.data;
      console.log("🔍 투두 목록:", todos);
      return todos;
    } else {
      console.error("🔍 투두 목록 가져오기 실패:", response);
      return [];
    }
  });
}

export function addTodo(todo) {
  window.electronAPI.addTodo(todo).then(() => {
    getTodos();
  });
}

export function deleteTodo(id) {
  window.electronAPI.deleteTodo(id).then(() => {
    getTodos();
  });
}

export function completeTodo(id, todo) {
  todo.done = !todo.done;
  return window.electronAPI.patchTodo(id, todo).then((response) => {
    if (response.status === 200) {
      console.log("🔍 투두 업데이트 성공:", response.data);
    } else {
      console.error("🔍 투두 업데이트 실패:", response);
    }
  });
}
