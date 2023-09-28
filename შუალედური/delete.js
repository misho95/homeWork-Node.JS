const { program } = require("commander");

const { writeFile, readFile, existsSync } = require("fs");

program.option("-d <char>");

program.parse();

const options = program.opts();

if (existsSync("data.json")) {
  readFile("data.json", (err, data) => {
    if (err) {
      console.log("error", err);
      return;
    }
    const parsedData = JSON.parse(data);

    const updated = parsedData.filter((x) => {
      if (x.id !== +options.d) {
        return x;
      }
    });

    writeFile("data.json", JSON.stringify(updated), (err) => {
      if (err) console.log("error", err);
      console.log("done");
    });
  });
}
