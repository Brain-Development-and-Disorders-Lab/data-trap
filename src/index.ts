#!/usr/bin/env node

import "dotenv/config";
import path from "path";
import chalk from "chalk";
import boxen from "boxen";
import yargs from "yargs";
import fs from "fs";

// Instantiate options
const options = yargs
  .usage("Usage: datatrap -s <source> -d <destination>")
  .option("s", { alias: "source", describe: "Data source directory", type: "string", demandOption: false })
  .option("d", { alias: "destination", describe: "Destination directory", type: "string", demandOption: false })
  .argv;

let defaultOptions = {
  source: path.dirname(__filename),
  destination: process.env.DESTINATION,
};

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
    return;
  } else {
    console.log(chalk.green.bold(`Connection to "${defaultOptions.destination}" successful.`));
  }
});

// Start Chokidar on the source directory
