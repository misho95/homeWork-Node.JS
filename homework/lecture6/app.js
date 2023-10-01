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

const commentOwnerMiddleWare = (req, res, next) => {
  const postId = req.params.id;
  const cid = req.body.cid;

  if (!postId || !cid) {
    res.status(400).send("no id's");
  }

  const findPost = posts.find((p) => {
    if (+p.id === +postId) return p;
  });

  if (!findPost) {
    res.status(400).send("no post found");
  }

  req["post"] = findPost;

  const findComment = findPost.comments.find((c) => {
    if (+c.id === +cid) return c;
  });

  if (!findComment) {
    res.status(400).send("no comments found");
  }

  if (req.session.id === findComment.userId) {
    req["owner"] = true;
  } else {
    req["owner"] = false;
  }
  next();
};

const roleMiddleware = (req, res, next) => {
  if (req.owner !== true && req.session.role !== "admin") {
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

app.get("/posts/:id", (req, res) => {
  const postId = req.params.id;
  const getPostById = posts.find((p) => {
    if (+p.id === +postId) return p;
  });
  if (!getPostById) {
    res.status(400).send("no post found with this ID");
  }

  res.status(200).json(getPostById);
});

app.post("/posts", myLoggerMidleWare, sessionMidleWare, (req, res) => {
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

app.delete(
  "/posts/:id",
  myLoggerMidleWare,
  sessionMidleWare,
  roleMiddleware,
  (req, res) => {
    const postId = req.params.id;
    const deletePost = posts.filter((p) => {
      if (p.id !== +postId) return p;
    });

    posts = deletePost;
    res.status(200).json(deletePost);
  }
);

app.put(
  "/posts/:id",
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
    res.status(200).json(editPost);
  }
);

app.post(
  "/posts/:id/comments",
  myLoggerMidleWare,
  sessionMidleWare,
  (req, res) => {
    const postId = req.params.id;
    const comment = req.body.comment;
    const updatePost = posts.map((p) => {
      if (+p.id === +postId) {
        return {
          ...p,
          comments: [
            ...p.comments,
            { id: new Date().getTime(), userId: req.session.id, comment },
          ],
        };
      } else return p;
    });
    posts = updatePost;
    res.status(200).json(updatePost);
  }
);

app.put(
  "/posts/:id/comments",
  myLoggerMidleWare,
  sessionMidleWare,
  commentOwnerMiddleWare,
  roleMiddleware,
  (req, res) => {
    const postId = req.params.id;
    const cid = req.body.cid;
    const updated = req.post.comments.map((c) => {
      if (+c.id === +cid) {
        return { ...c, comment: req.body.comment };
      } else return c;
    });

    console.log(updated);

    const updatePosts = posts.map((p) => {
      if (+p.id === +postId) {
        return {
          ...p,
          comments: updated,
        };
      } else return p;
    });

    posts = updatePosts;

    res.status(200).json(updatePosts);
  }
);

app.delete(
  "/posts/:id/comments",
  myLoggerMidleWare,
  sessionMidleWare,
  commentOwnerMiddleWare,
  roleMiddleware,
  (req, res) => {
    const postId = req.params.id;
    const cid = req.body.cid;
    const deleted = req.post.comments.filter((c) => {
      if (+c.id !== +cid) return c;
    });

    const updatePosts = posts.map((p) => {
      if (+p.id === +postId) {
        return {
          ...p,
          comments: deleted,
        };
      } else return p;
    });

    posts = updatePosts;

    res.status(200).json(updatePosts);
  }
);

app.listen(3000, () => console.log("server is on port 3000"));
