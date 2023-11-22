const todoContainer = document.getElementById("container");
let skip = 0;
window.onload = getTodos();

//Event listener to catch the action of adding todo, edit todo, delete todo, etc..
document.addEventListener("click", (e) => {
  const option = e.target.classList.value;
  switch (option) {
    case "edit":
      editTodo(e);
      break;
    case "delete":
      deleteTodo(e);
      break;
    case "show-more":
      getTodos();
      break;
    case "add-todo":
      addTodo(e);
    default:
      break;
  }
})

// Function to get all todos loggedin user
function getTodos() {
  axios.get(`http://localhost:3000/pagination-dashboard?skip=${skip}`)
    .then((res) => {
      renderTodos(res.data.data);
    })
    .catch((err) => {
      console.log(err)
    })
}

// function to make an entry of new todo
function addTodo(e) {
  e.preventDefault();
  const newText = document.getElementById("new-text").value;
  axios.post("http://localhost:3000/add_todo", { todoitem: newText })
    .then((res) => {
      if (res.data.status !== 201) {
        alert(res.data.message);
      }
      document.getElementById("new-text").value = "";
      getTodos();
    })
    .catch((err) => {
      console.log(err)
    })
}

//Function to render todos to ui
function renderTodos(todos) {
  if (todos.length === 0) {
    alert("No more todos to show");
    return;
  }
  todos.forEach((item) => {
    const todo = document.createElement("div");
    todo.classList.add("todo")
    todo.innerHTML = `
          <div class="text">
            ${item.todo}
          </div>
          <div class="btns">
            <button class="edit" id="${item._id}">Edit</button>
            <button class="delete" id="${item._id}">Delete</button>
          </div>`
    todoContainer.append(todo);
  })
  skip += todos.length;
}

// Function to hancdle edit todo
function editTodo(e) {
  const id = e.target.id;
  const newText = prompt("Enter new text: ");
  axios.post("http://localhost:3000/edit_todo", {
    id,
    newText,
  }).then((res) => {
    const text = e.target.parentElement.parentElement.querySelector(".text");
    if (newText.length !== 0) {
      text.innerText = newText;
    }
  }).catch((err) => {
    console.log(err)
  })
}

// Function to hancdle delete todo
function deleteTodo(e) {
  const confirmation = confirm("Want to delete this?");
  const id = e.target.id;
  if (confirmation) {
    axios.post("/delete_todo", {
      id: id
    }).then((res) => {
      console.log(res.data)
      const deletedTodo = e.target.parentElement.parentElement
      deletedTodo.remove();
    }).catch((error) => {
      console.log(error);
    })
  }
}