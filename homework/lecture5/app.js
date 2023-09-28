const express = require("express");

const app = express();

const users = [
  {
    id: 1,
    userName: "misho95",
    fullName: "misho chapidze",
    email: "misho@mail.ru",
    date: "9/28/2023",
    password: "123456",
  },
];

app.use(express.json());

app.get("/", (req, res) => {
  res.json(users);
});

app
  .route("/api/v1/users/signin")
  .get((req, res) => {
    res.send("signin");
    res.status(200);
  })
  .post((req, res) => {
    const userFind = users.find((usr) => {
      if (req.body.email === usr.email && req.body.pass === usr.password) {
        return usr;
      }
    });

    if (!userFind) {
      res.send("erro: no user found");
      res.status(400);
    }
    console.log(userFind.id);
    res.send("singed");
    res.status(200);
  });

app
  .route("/api/v1/users/signup")
  .get((req, res) => {
    res.send("singup");
    res.status(200);
  })
  .post((req, res) => {
    if (req.body.userName === "") {
      res.send("input is empty!");
      res.status(400);
      return;
    }

    const exists = users.some((user) => user.email === req.body.email);

    if (exists) {
      res.send("email is already in use!");
      res.status(400);
      return;
    }

    if (req.body.password.length < 6) {
      res.send("password is short!");
      res.status(400);
      return;
    }

    res.status(201);
    users.push({ id: 2, ...req.body });
    console.log(users);
    res.send("new user is added");
  });

app.get("/api/v1/users/session", (req, res) => {});

app.listen(3000, () => console.log("Example app is listening on port 3000."));
