// const apiBase = 'https://localhost:5001/api/todo';

const apiBase = '/api/todo';

// fetch all todos from the API
// returns an array of ToDoOtemDto or an empty array on failure

async function fetchTodos() {
  const res = await fetch(apiBase);
  if (!res.ok) return [];
  return res.json();
}

// create a new todo
async function createTodo(description) {
  const res = await fetch(apiBase, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: description,
      isDone: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to create todo: ${res.status} ${text}`,
    );
  }
}

// update a todo
async function updateTodo(id, dto) {
  const res = await fetch(`${apiBase}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to update todo: ${res.status} ${text}`,
    );
  }
}

// delete a todo by id
async function deleteTodo(id) {
  const res = await fetch(`${apiBase}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to delete todo: ${res.status} ${text}`,
    );
  }
}

// Render the list of todos into the <ul id="todos-list"> element.
// Each item shows a checkbox (toggles isComplete), a name, and Edit/Delete buttons.

function renderTodos(todos) {
  const ul = document.getElementById('todos-list');
  ul.innerHTML = '';
  todos.forEach((t) => {
    const li = document.createElement('li');

    const left = document.createElement('div');
    left.className = 'todo-left';

    // Checkbox toggles the isComplete state. We call the API with the full DTO.
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = t.isDone;
    cb.addEventListener('change', async () => {
      try {
        await updateTodo(t.id, {
          id: t.id,
          description: t.description,
          isDone: cb.checked,
        });
        await refresh();
      } catch (err) {
        // In a real app show a non-blocking message in the UI instead of alert.
        alert(err);
      }
    });

    const name = document.createElement('div');
    name.className =
      'todo-name' + (t.isDone ? ' completed' : '');
    name.textContent = t.description;

    left.appendChild(cb);
    left.appendChild(name);

    const right = document.createElement('div');

    // Edit opens a simple prompt to change the name. It then calls PUT.
    // For better UX replace this with inline editing or a modal.
    const editBtn = document.createElement('button');
    editBtn.className = 'small-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      const newName = prompt('Edit todo', t.description);
      if (newName !== null) {
        updateTodo(t.id, {
          id: t.id,
          description: newName,
          isDone: t.isDone,
        })
          .then(refresh)
          .catch((err) => alert(err));
      }
    });

    // Delete asks for confirmation then calls DELETE.
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'small-btn danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      if (!confirm('Delete this todo?')) return;
      deleteTodo(t.id)
        .then(refresh)
        .catch((err) => alert(err));
    });

    right.appendChild(editBtn);
    right.appendChild(deleteBtn);

    li.appendChild(left);
    li.appendChild(right);

    ul.appendChild(li);
  });
}

// refresh the UI by fetching data
async function refresh() {
  const todos = await fetchTodos();
  renderTodos(todos);
}

// wire up the form and initial load
window.addEventListener('DOMContentLoaded', () => {
  console.log('before refresh');
  const form = document.getElementById(
    'new-todo-item-form',
  );
  const input = document.getElementById(
    'new-todo-item-name-input',
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return; // guard against empty input

    try {
      await createTodo(v);
      input.value = '';
      await refresh();
    } catch (error) {
      alert(error);
    }
  });

  // initial load of todos
  refresh();
});
