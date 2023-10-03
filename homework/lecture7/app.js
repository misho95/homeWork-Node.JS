const express = require("express");

const app = express();

// 1. uses ejs template engine
app.use("/static", express.static(__dirname + "/public"));

app.set("view engine", "ejs");
app.use(express.json());

const expenses = [
  {
    id: 1,
    type: "income",
    amount: 200,
    category: "shopping",
  },
  {
    id: 2,
    type: "income",
    amount: 600,
    category: "sallary",
  },
  {
    id: 3,
    type: "income",
    amount: 600,
    category: "sallary",
  },
];

// სტატიკური საიტი
// 1. root / გვერდი index.ejs
// 2. expenses /expenses expenses.ejs
// 3. add /add addexpenes.ejs ->
// 5. signin /signin signin.ejs
// 6. signup /signup.ejs
// 7. /expenses/id -> expense-details.ejs

app.get("/", function (req, res) {
  res.render("index", { expenses });
});

app.get("/post/:id", (req, res) => {
  const postId = req.params.id;
  const post = expenses.find((p) => {
    if (p.id === +postId) return p;
  });

  res.render("posts", { post });
});

app.listen(3000, () => console.log("server is on port 3000"));
