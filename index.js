import { Command } from "commander";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import Table from "cli-table3";
import chalk from "chalk";
import prompts from "prompts";



const program = new Command();
const client = new PrismaClient();

program
  .name(" Todo CLI App")
  .description("Manage your todo list")
  .version("1.0.0");

const newTodo = program.command("add-todo");
newTodo.description("Add a new todo");
newTodo.requiredOption("-t, --title <value>", "Title of the todo");
newTodo.requiredOption("-d, --description <value>", "Description of the todo");
newTodo.requiredOption("-s, --status <value>", "Status of the todo");

newTodo.action(async (options) => {
  try {
    const todo = await client.todo.create({
      data: {
        id: nanoid(4),
        todoTitle: options.title,
        todoDescription: options.description,
        todoStatus: options.status,
      },
    });
    console.log(chalk.bgGreen("Todo created successfully ✔✔✔✔✔"));

    const table = new Table({
      head: ["ID", "Title", "Description", "Status"],
    });

    table.push([
      todo.id,
      todo.todoTitle,
      todo.todoDescription,
      todo.todoStatus,
    ]);
    console.log(table.toString());
  } catch (error) {
    console.log(chalk.bgRed("There was an erro creating the todo", error));
  }
});

const readTodos = program.command("read-todos");
readTodos.description("Read a specific todo");
readTodos.option("-i, --id <value>", "ID of the todo");

readTodos.action(async (options) => {
  try {
   const id = options.id;

    if (id) {
      const todo = await client.todo.findFirst({
        where: {
          id
        },
      });
      if(!todo){
        console.log(chalk.bgRed(`Todo with id ${id} not found`));
        return;
      }
      const table = new Table({
        head: ["ID", "Title", "Description", "Status"],
      });

      table.push([
        todo.id,
        todo.todoTitle,
        todo.todoDescription,
        todo.todoStatus,
      ]);
      console.log(table.toString());
    } else {
      const todos = await client.todo.findMany();
      const table = new Table({
        head: ["ID", "Title", "Description", "Status"],
      });

      todos.forEach((todo) => {
        table.push([
          todo.id,
          todo.todoTitle,
          todo.todoDescription,
          todo.todoStatus,
        ]);
      });
      console.log(table.toString());
      
    }
  } catch (error) {
    console.log(chalk.bgRed("There was an error reading the todos", error));
  }
});

program
.command("update-todo")
.description("Update a specific todo")
.requiredOption("-i, --id <value>", "ID of the todo")
.option("-t, --title <value>", "Title of the todo")
.option("-d, --description <value>", "Description of the todo")
.option("-s, --status <value>", "Status of the todo")

.action(async function (options){  
  const id = options.id;
  const newTitle = options.title;
  const newDescription = options.description;
  const newStatus = options.status;
  try {
    const updateTodo = await client.todo.update({
      where:{
        id,
      },
      data: {
        todoTitle: newTitle && newTitle,
        todoDescription: newDescription && newDescription,
        todoStatus: newStatus && newStatus,
      },
      });
      console.log(chalk.bgGreen("Todo with id " + options.id + " updated successfully ✔✔✔✔✔"));
     
} catch (error) {
    console.log(chalk.bgRed("There was an error updating the todo", error));
  }
});

program
.command("delete-todo")
.description("Delete a specific todo")
.requiredOption("-i, --id <value>", "ID of the todo")

.action(async function (options){  
  const id = options.id;
  try {
    const deleteTodo = await client.todo.delete({
      where:{
        id,
      },
      });
      console.log(chalk.bgGreen("Todo with id " + options.id + " deleted successfully ✔✔✔✔✔"));
     
} catch (error) {
    console.log(chalk.bgRed("There was an error deleting the todo", error));
  }
});

program 
.command("delete-all-todos")
.description("Delete all todos")
.action(async function (options){  
  try {
  console.log(chalk.bgYellow("Are you sure you want to delete all todos?"));
  const response = await prompts({
    type: "select"
    ,name: "value",
    message:"Are you sure you want to delete all todos?",
    choices: [
      { title: "Yes", value: "yes" },
      { title: "No", value: "no" },
    ],
  });
  if (response.value === "yes") {
    const deleteTodos = await client.todo.deleteMany();
    console.log(chalk.bgGreen("All todos deleted successfully ✔✔✔✔✔"));
  }

     
} catch (error) {
    console.log(chalk.bgRed("There was an error deleting the todos", error));
  }
});

program.parseAsync();
