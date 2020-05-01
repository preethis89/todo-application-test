const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require('body-parser');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "todo",
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/tasks", function (request, response) {
  
  connection.query("SELECT * FROM task", function (err, data) {
    if (err) {
      console.log("Error from MySQL", err);
      response.status(500).send(err);
    } else {
      response.status(200).send(data);
    }
  });
});
app.post('/tasks', (req, res) => {
  const data = req.body;

  const query = 'INSERT INTO task (status, date, text, priority,userId) values (?,?,?,?,?)';
  // eslint-disable-next-line no-sequences
  connection.query(query, [0, data.date, data.text, data.priority, 1001], (err, results) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('Error in Mysql', err);
      res.status(500).send(err);
    } else {
      // eslint-disable-next-line no-shadow
      connection.query(`SELECT * FROM task WHERE taskId = ${results.insertId}`, (err, results) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('Error in Mysql', err);
          res.status(500).send(err);
        // eslint-disable-next-line brace-style
        }
        // eslint-disable-next-line no-empty
        else {
          res.status(201).send(results[0]);
        }
      });
    }
  });
});
app.delete('/tasks/:taskId', (request, response) => {
  // eslint-disable-next-line radix
  // const { taskId } = request.params;
  // eslint-disable-next-line no-template-curly-in-string
  const query = 'Delete from task where taskId = ?';
  connection.query(query, [request.params.taskId], (err, data) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('Error in Mysql', err);
      response.status(500).send(err);
    } else {
      // eslint-disable-next-line no-template-curly-in-string
      response.status(200).send('Deleted task');
    }
  });
});

app.put('/tasks/:taskId', (request, response) => {
  const { taskId } = request.params;
  const data = request.body;
  const query = 'UPDATE task set ? WHERE taskId = ?';
  // eslint-disable-next-line no-unused-vars
  connection.query(query, [data, taskId], (err, results) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.log('Error from MySQL while inserting task', err);
      response.status(500).send(err);
    } else {
      response.status(200).send(`Updated task with ID ${taskId} and data ${JSON.stringify(data)}`);
    }
  });
});

module.exports.app = serverless(app);