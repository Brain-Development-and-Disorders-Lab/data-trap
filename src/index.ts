#!/usr/bin/env node

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
  .option("d", { alias: "destinations", describe: "Destination directory", type: "array", demandOption: true })
  .argv;

let defaultOptions = {
  source: path.dirname(__filename),
  destinations: options["destinations"],
};

if (options["source"]) {
  defaultOptions.source = options["source"];
}

// Show a title
console.log(boxen(chalk.white.bold("Sync data from your experiment to multiple directories!"), {
  title: "Data Trap",
  titleAlignment: "center",
  padding: 1,
  borderStyle: "round",
  borderColor: "black",
}));

console.log(chalk.green.bold(`Starting on "${defaultOptions.source}".`));

for (const destinationPath of defaultOptions.destinations) {
  console.log(chalk.green.bold(`Testing access to destination "${destinationPath}"...`));

  // Validate the specified remote path, must be a mounted network drive
  fs.access(destinationPath, (error) => {
    if (error) {
      console.error(chalk.red.bold(`Could not access destination "${destinationPath}"! Exiting...`));
      exit(1);
    } else {
      console.log(chalk.green.bold(`Successfully accessed "${destinationPath}".`));
    }
  });
}

/**
 * Register a file to be watched by the Chokidar observer instance
 * @param {string} addPath Complete path of the file to be added
 */
const addFile = (addPath: string) => {
  for (const destinationPath of defaultOptions.destinations) {
    fs.copy(addPath, path.join(destinationPath, path.basename(addPath)))
      .then(() => console.log(chalk.green.bold(`Added "${addPath}" successfully to "${destinationPath}"!`)))
      .catch(err => console.error(chalk.red.bold(`Error adding "${addPath}": ${err}`)));
  }
}

/**
 * Apply an update to a file currently being watched by the Chokidar observer instance
 * @param {string} changePath Complete path of the file that has changed
 */
const changeFile = (changePath: string) => {
  for (const destinationPath of defaultOptions.destinations) {
    fs.copy(changePath, path.join(destinationPath, path.basename(changePath)))
      .then(() => console.log(chalk.blue.bold(`File ${changePath} has been updated.`)))
      .catch(err => console.error(chalk.red.bold(`Error updating "${changePath}": ${err}`)));
  }
}

// Start Chokidar on the source directory
const observer = chokidar.watch(defaultOptions.source, { persistent: true });
const changeLog = console.log.bind(console);

// Configure events
observer
  .on("ready", () => changeLog(chalk.green.bold("Data Trap ready, watching...")))
  .on("add", changePath => addFile(changePath))
  .on("change", changePath => changeFile(changePath));
