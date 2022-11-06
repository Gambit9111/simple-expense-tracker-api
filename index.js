const express = require('express')
const app = express()
const fs = require('fs');
const cors = require('cors')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))


// @@@@@function that reads expenses from the database
function readExpenses() {
  fs.readFile('expenses.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("expenses read from file", '\n');
      expenses = JSON.parse(data);
    }
  });
}


// @@@@@function that saves expenses to the database
function saveExpenses() {
  fs.writeFile('expenses.json', JSON.stringify(expenses), (err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      console.log("expenses saved to file", '\n');
    }
  });
}


// @@@@@ function that generates a new id for a new expense
function generateId() {
  let maxId = 0;
  for (let i = 0; i < expenses.length; i++) {
    if (expenses[i].id > maxId) {
      maxId = expenses[i].id;
    }
  }
  return maxId + 1;
}


// run this function to read expenses from the database
let expenses = readExpenses();

// get all expenses
app.get('/api/expenses', (request, response) => {
  response.json(expenses)
  console.log('request.url: ' + request.url, '\n');
  console.log('request.method: ' + request.method, '\n');
  console.log('request.headers: ' + JSON.stringify(request.headers), '\n');
  console.log('request.ip: ' + request.ip, '\n');
})


// get one expense
app.get('/api/expenses/:id', (request, response) => {
  const id = Number(request.params.id)
  const expense = expenses.find(expense => expense.id === id)

  console.log('request.url: ' + request.url, '\n');
  console.log('request.method: ' + request.method, '\n');
  console.log('request.headers: ' + JSON.stringify(request.headers), '\n');
  console.log('request.ip: ' + request.ip, '\n');
  console.log('request.params: ' + JSON.stringify(request.params), '\n');
  console.log('request.body: ' + JSON.stringify(request.body), '\n');

  if (expense) {
    response.json(expense)
  } else {
    response.status(404).end()
  }
})

// calculates current date in a nice format
const getCurrentDate = () => {
  const t = new Date();
  const date = ("0" + t.getDate()).slice(-2);
  const month = ("0" + (t.getMonth() + 1)).slice(-2);
  const year = t.getFullYear();
  return `${date}/${month}/${year}`;
}

// create a new expense
app.post('/api/expenses', (request, response) => {
  const body = request.body

  console.log('request.url: ' + request.url, '\n');
  console.log('request.method: ' + request.method, '\n');
  console.log('request.headers: ' + JSON.stringify(request.headers), '\n');
  console.log('request.ip: ' + request.ip, '\n');
  console.log('request.params: ' + JSON.stringify(request.params), '\n');
  console.log('request.body: ' + JSON.stringify(request.body), '\n');

  if (!body.name || !body.amount) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  const expense = {
    name: body.name,
    amount: body.amount,
    date: getCurrentDate(),
    id: generateId(),
  }
  expenses = expenses.concat(expense)
  saveExpenses();
  response.json(expense)
})


// update an expense
app.put('/api/expenses/:id', (request, response) => {
  const id = Number(request.params.id)
  const body = request.body
  const expense = expenses.find(expense => expense.id === id)
  if (!expense) {
    return response.status(404).json({
      error: 'expense not found'
    })
  }
  const updatedExpense = {
    ...expense,
    name: body.name,
    amount: body.amount,
  }
  expenses = expenses.map(expense => expense.id !== id ? expense : updatedExpense)
  saveExpenses();
  response.json(updatedExpense)
})


// delete an expense and save the new expenses to the database
app.delete('/api/expenses/:id', (request, response) => {
  const id = Number(request.params.id)

  console.log('request.url: ' + request.url, '\n');
  console.log('request.method: ' + request.method, '\n');
  console.log('request.headers: ' + JSON.stringify(request.headers), '\n');
  console.log('request.ip: ' + request.ip, '\n');

  expenses = expenses.filter(expense => expense.id !== id)
  if (expenses) {
    saveExpenses();
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})


// ////////////////////////////////////////////////////////////////////////////
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})