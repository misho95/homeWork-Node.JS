const moment = require("moment");

const dateNow = moment().format("2023/09/10");
const secondDate = moment().format("2023/06/16");

// console.log(dateNow);
// console.log(moment().subtract(20, "days").calendar());

///დოკუმენტაციაში ვერ ვნახე როგორ გამოვთვალო სხვაობა

const users = [
  {
    id: 1,
    name: "misho",
  },
  {
    id: 2,
    name: "gio",
  },
];

const http = require("http");
const url = require("url");

http
  .createServer(function (req, res) {
    const q = url.parse(req.url, true);
    const path = q.pathname;
    const userNamePath = path.split("/users/");
    const userName = userNamePath[1];
    switch (req.url) {
      case "/":
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end('<div><a href="/users">Users</a></div>');
        break;

      case `/users`:
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(JSON.stringify(users));
        break;

      case `/users/${userName}`:
        const findUser = users.find((u) => {
          if (u.name === userName) return u;
        });

        if (findUser) {
          res.setHeader("Content-Type", "application/json");
          res.writeHead(200);
          res.end(JSON.stringify(findUser));
        } else {
          res.setHeader("Content-Type", "text/html");
          res.writeHead(200);
          res.end("<div>No User Found!</div>");
        }
        break;

      default:
        res.writeHead(404);
        res.end(JSON.stringify({ error: "Resource not found" }));
    }
  })
  .listen(8080);
