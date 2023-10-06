const { program } = require("commander");
const moment = require("moment");
const { writeFile, readFile, existsSync } = require("fs");

program
  .option("-amount <char>")
  .option("-category <char>")
  .option("-type <char>");

program.parse();

const options = program.opts();

const date = moment().format("MMMM Do YYYY, h:mm:ss a");

if (existsSync("data.json")) {
  readFile("data.json", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    const parsedData = JSON.parse(data);
    const updated = [
      ...parsedData,
      {
        ...options,
        id: Math.floor(Math.random() * 1000000),
        date,
      },
    ];

    console.log(updated);
    writeFile("data.json", JSON.stringify(updated), (err) => {
      if (err) console.log("error", err);
      console.log("done");
    });
  });

  return;
}

writeFile(
  "data.json",
  JSON.stringify([
    {
      ...options,
      id: Math.floor(Math.random() * 1000000),
      date,
    },
  ]),
  (err) => {
    if (err) {
      console.log("error: ", err);
    }

    console.log("done");
  }
);
