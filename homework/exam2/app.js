const { readFile, writeFile } = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const sessionStorage = require("sessionstorage-for-nodejs");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
// 1. uses ejs template engine
app.use("/static", express.static(__dirname + "/public"));

app.set("view engine", "ejs");
app.use(express.json());

const authMiddleWear = (req, res, next) => {
  const token = sessionStorage.getItem("accessToken");
  if (!token) {
    res.redirect("/signin");
    res.status(403);
    return;
  }

  req["token"] = token;
  next();
};

const authMiddleWearForm = (req, res, next) => {
  const localToken = sessionStorage.getItem("accessToken");
  if (localToken) {
    res.redirect("/");
    return;
  }

  next();
};

app.get("/", authMiddleWear, (req, res) => {
  readFile(path.join(__dirname, "expense.json"), (err, data) => {
    if (err) {
      res.render("index", { expenses: [] });
      return;
    }
    const token = req.token;
    const allExpenses = JSON.parse(data);
    const expenses = allExpenses.filter((e) => {
      if (+e.userId === +token) {
        return e;
      }
    });
    res.render("index", { expenses });
  });
});

app.get("/add", authMiddleWear, (req, res) => {
  res.render("add");
});

app.post("/add", authMiddleWear, (req, res) => {
  const { amount, type, category } = req.body;

  const exp = {
    id: new Date().getTime(),
    amount,
    type,
    category,
    userId: req.token,
  };

  readFile(path.join(__dirname, "expense.json"), (err, data) => {
    if (err) {
      // create new file
      writeFile("expense.json", JSON.stringify([exp]), function (err) {
        if (err) throw err;
        res.status(200);
        return;
      });
    } else {
      const parseData = JSON.parse(data);
      writeFile("expense.json", JSON.stringify([...parseData, exp]), (err) => {
        if (err) throw err;
        res.status(200);
      });
    }
  });

  res.redirect("/");
});

app.delete("/delete/:id", authMiddleWear, (req, res) => {
  const id = req.params.id;

  readFile(path.join(__dirname, "expense.json"), (err, data) => {
    if (err) {
      res.status(400);
      throw err;
    }
    const expenses = JSON.parse(data);
    const deleteData = expenses.filter((e) => {
      if (+e.id !== +id) return e;
    });

    writeFile("expense.json", JSON.stringify(deleteData), (err) => {
      if (err) throw err;
      res.status(200).send("okey!");
    });
  });
});

app.get("/edit/:id", authMiddleWear, (req, res) => {
  const id = req.params.id;

  readFile(path.join(__dirname, "expense.json"), (err, data) => {
    if (err) {
      res.status(400);
      throw err;
    }

    const expenses = JSON.parse(data);

    const findExpense = expenses.find((e) => {
      if (+e.id === +id) return e;
    });

    const expense = findExpense;

    res.render("edit", { expense });
    res.status(200);
  });
});

app.post("/edit/:id", authMiddleWear, (req, res) => {
  const id = req.params.id;
  const { amount, type, category } = req.body;

  readFile(path.join(__dirname, "expense.json"), (err, data) => {
    if (err) {
      res.status(400);
      throw err;
    }

    const expenses = JSON.parse(data);

    const update = expenses.map((e) => {
      if (+e.id === +id) {
        return {
          ...e,
          amount,
          type,
          category,
        };
      } else {
        return e;
      }
    });

    writeFile("expense.json", JSON.stringify(update), (err) => {
      if (err) {
        res.status(400);
        throw err;
      }
      res.status(200);
      res.redirect("/");
    });
  });
});

app.get("/signin", authMiddleWearForm, (req, res) => {
  res.render("signin");
});

app.post("/signin", authMiddleWearForm, (req, res) => {
  readFile(path.join(__dirname, "users.json"), (err, data) => {
    if (err) {
      res.status(400);
      return;
    }

    const parseUsers = JSON.parse(data);

    const findUser = parseUsers.find((usr) => {
      if (usr.email === req.body.email && usr.pass === req.body.pass) {
        return usr;
      }
    });

    if (!findUser) {
      res.status(400);
      return;
    }

    sessionStorage.setItem("accessToken", findUser.id);
    res.status(200);
    res.redirect("/");
  });
});

app.get("/signup", authMiddleWearForm, (req, res) => {
  readFile(path.join(__dirname, "users.json"), (err, data) => {
    const userData = JSON.parse(data);
    res.render("signup", { data: userData });
  });
});

app.post("/signup", authMiddleWearForm, (req, res) => {
  const user = {
    id: new Date().getTime(),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    pass: req.body.pass,
  };

  readFile(path.join(__dirname, "users.json"), (err, data) => {
    if (err) {
      // create new file
      writeFile("users.json", JSON.stringify([user]), function (err) {
        if (err) throw err;
        res.status(200);
        sessionStorage.setItem("accessToken", user.id);
        return;
      });
    } else {
      const parsedUserData = JSON.parse(data);
      writeFile(
        "users.json",
        JSON.stringify([...parsedUserData, user]),
        (err) => {
          if (err) throw err;
          res.status(200);
          sessionStorage.setItem("accessToken", user.id);
        }
      );
    }
  });

  res.redirect("/");
});

app.post("/logout", authMiddleWear, (req, res) => {
  if (!req.token) {
    res.status(400);
    return;
  }

  sessionStorage.removeItem("accessToken");
  res.status(200);
  res.redirect("/signin");
});

app.listen(3000, () => console.log("server is on port 3000"));
