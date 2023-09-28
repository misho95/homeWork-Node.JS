const { program } = require("commander");

const { readFile, existsSync } = require("fs");

program.option("-s <char>");

program.parse();

const options = program.opts();

if (existsSync("data.json")) {
  readFile("data.json", (err, data) => {
    if (err) {
      console.log("error", err);
      return;
    }
    const parsedData = JSON.parse(data);

    const search = parsedData.find((x) => {
      if (
        x.Amount === +options.s ||
        x.Category === options.s ||
        Type === options.s ||
        date === options.s
      ) {
        return x;
      }
    });

    if (search) {
      console.log(search);
    } else {
      console.log("no invoice found");
    }
  });
}
