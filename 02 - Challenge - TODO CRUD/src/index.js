const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userAlreadyExists = users.find((user) => user.username === username);

  if (!userAlreadyExists) {
    return response.status(404).json({ error: 'Username dont exists' });
  }
  request.username = userAlreadyExists;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists' });
  }
  const newUser =
  {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser);
  return response.send(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // const { username } = request.headers;
  // const todos = users.find((user) => user.username === username).todos;
  // return response.json(todos);
  // o jeito de cima funciona tbm, mas é redundante
  const { username } = request;
  return response.json(username.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const todo =
  {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  username.todos.push(todo);
     
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;
  const { id } = request.params;

  const existsTodo = username.todos.find((user) => user.id === id);

  if(!existsTodo) {
    return response.status(404).json({ error: 'Todo not found'})
  }
  existsTodo.title = title;
  existsTodo.deadline = new Date(deadline);

  return response.json(existsTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const existsTodo = username.todos.find((user) => user.id === id);

  if(!existsTodo) {
    return response.status(404).json({ error: 'Todo not found'})
  }

  existsTodo.done = true;
  
  return response.json(existsTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todoIndex = username.todos.findIndex((todo) => todo.id === id);

  if(todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found'})
  }

  username.todos.splice(todoIndex, 1);

  return response.status(204).json();

});

module.exports = app;