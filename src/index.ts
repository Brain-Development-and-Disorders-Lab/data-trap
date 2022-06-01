#!/usr/bin/env node

// .env file
import "dotenv/config";

// File imports
import fs from "fs-extra";
import path from "path";
import * as chokidar from "chokidar";

// CLI imports
import chalk from "chalk";
import boxen from "boxen";
import yargs from "yargs";
import { exit } from "process";

// Instantiate options
const options = yargs
  .usage("Usage: datatrap -s <source> -d <destination>")
  .option("s", { alias: "source", describe: "Data source directory", type: "string", demandOption: false })
  .option("d", { alias: "destination", describe: "Destination directory", type: "string", demandOption: true })
  .argv;

let defaultOptions = {
  source: path.dirname(__filename),
  destination: process.env.DESTINATION,
};

if (options["source"]) {
  defaultOptions.source = options["source"];
} else if (options["destination"]) {
  defaultOptions.destination = options["destination"];
}

// Show a title
console.log(boxen(chalk.white.bold("Data Trap"), {
  padding: 1,
  margin: 1,
  borderStyle: "round",
  borderColor: "black",
}));

console.log(chalk.green.bold(`Data Trap starting on "${defaultOptions.source}".`));
console.log(chalk.green.bold(`Testing connection to "${defaultOptions.destination}"...`));

// Validate the specified remote path, must be a mounted network drive
fs.access(defaultOptions.destination, function(error) {
  if (error) {
    console.error(chalk.red.bold(`Could not connect to "${defaultOptions.destination}"! Exiting...`));
    exit(1);
  } else {
    console.log(chalk.green.bold(`Connection to "${defaultOptions.destination}" successful.`));
  }
});

// Start Chokidar on the source directory
const observer = chokidar.watch(defaultOptions.source, { persistent: true });
const changeLog = console.log.bind(console);

// Configure events
observer
  .on("ready", () => changeLog(chalk.green.bold("Data Trap ready, watching...")))
  .on("add", (changePath) => {
    fs.copy(changePath, path.join(defaultOptions.destination, path.basename(changePath)))
      .then(() => console.log(chalk.green.bold(`Added "${changePath}" successfully!`)))
      .catch(err => console.error(chalk.red.bold(`Error adding "${changePath}": ${err}`)));
  })
  .on("change", (changePath) => {
    fs.copy(changePath, path.join(defaultOptions.destination, path.basename(changePath)))
      .then(() => console.log(chalk.blue.bold(`File ${changePath} has been updated.`)))
      .catch(err => console.error(chalk.red.bold(`Error updating "${changePath}": ${err}`)));
  });
