const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { writeFile, unlink, mkdir, rmdir } = require("fs");
const path = require("path");

const fetchData = async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.text();

  mkdir(path.join(__dirname, "json"), (err) => {
    if (err) {
      console.log(`can't create new directory`);
    } else {
      console.log("success creating dir");
    }
  });

  writeFile(path.join(__dirname, "json/data.json"), data, (err) => {
    if (err) {
      console.log(`can't create new file`);
    } else {
      console.log("success adding file");
    }
  });

  setTimeout(() => {
    unlink(path.join(__dirname, "json/data.json"), (err) => {
      if (err) {
        console.log(`can't remove file`);
      } else {
        console.log("success removing file");
      }
    });
  }, 5000);

  setTimeout(() => {
    rmdir(path.join(__dirname, "json"), (err) => {
      if (err) {
        console.log(err);
        console.log(`can't remove directory`);
      } else {
        console.log("success removing dir");
      }
    });
  }, 8000);
};

fetchData();
