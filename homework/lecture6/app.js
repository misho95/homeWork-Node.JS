const express = require("express");

const app = express();

app.use(express.json());

const users = [
  {
    id: 1,
    firstname: "misho",
    lastname: "chapidze",
    email: "misho@mail.ru",
    password: "123456",
    createdAt: "9/29/2023",
    role: "admin",
  },
];

let posts = [
  {
    id: 1,
    title: "misho's post",
    description: "post des",
    userId: 1,
    comments: [],
  },
];

const myLoggerMidleWare = (req, res, next) => {
  const headers = req.headers;
  if (!headers.accesstoken) {
    res.send("no access");
    res.status(403);
    return;
  }
  req["userId"] = headers.accesstoken;
  next();
};

const sessionMidleWare = (req, res, next) => {
  const userId = req.userId;

  const getUserData = users.find((usr) => {
    if (usr.id === +userId) return usr;
  });

  if (!getUserData) {
    res.send("somthings wrong...");
    res.status(400);
    return;
  }

  req["session"] = getUserData;
  next();
};

const roleMiddleware = (req, res, next) => {
  if (req.session.role !== "admin") {
    res.send("no acces...");
    res.status(403);
  }
  next();
};

app.get("/", (req, res) => {
  res.json(users);
});

app.post("/signin", (req, res) => {
  if (!req.body) {
    res.send("invalid data...");
    res.status(400);
    return;
  }

  const checkUser = users.find((user) => {
    if (user.email === req.body.email && user.password === req.body.password)
      return user;
  });

  if (!checkUser) {
    res.send("No user Found...");
    res.status(400);
    return;
  }

  res.json({ accessToken: checkUser.id });
  res.status(200);
});

app.post("/signup", (req, res) => {
  const user = {
    id: new Date().getTime(),
    ...req.body,
    createdAt: new Date(),
    role: "user",
  };

  const checkEmail = users.find((usr) => {
    if (usr.email === user.email) return usr;
  });

  if (checkEmail) {
    res.send("Email is already in use...");
    res.status(400);
    return;
  }

  users.push(user);
  res.json({ accessToken: user.id });
  res.status(200);
});

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.post("/posts/add", myLoggerMidleWare, sessionMidleWare, (req, res) => {
  if (!req.body) {
    res.send("invalid data...");
    res.status(400);
    return;
  }

  const post = {
    ...req.body,
    id: new Date().getTime(),
    userId: req.session.id,
  };

  posts.push(post);
  res.send("data added");
});

app.post(
  "/posts/delete/:id",
  myLoggerMidleWare,
  sessionMidleWare,
  roleMiddleware,
  (req, res) => {
    const postId = req.params.id;
    const deletePost = posts.filter((p) => {
      if (p.id !== +postId) return p;
    });

    posts = deletePost;
    res.send("deleted");
    res.status(200);
  }
);

app.post(
  "/posts/edit/:id",
  myLoggerMidleWare,
  sessionMidleWare,
  roleMiddleware,
  (req, res) => {
    const postId = req.params.id;
    const editPost = posts.map((p) => {
      if (p.id === +postId) {
        return {
          id: p.id,
          comments: p.comments,
          userId: p.userId,
          ...req.body,
        };
      } else {
        return p;
      }
    });

    posts = editPost;
    res.send("edited");
    res.status(200);
  }
);

app.listen(3000, () => console.log("server is on port 3000"));
