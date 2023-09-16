const http = require("http");

const posts = [
  {
    id: 1,
    title: "post 1",
  },
  {
    id: 2,
    title: "post 2",
  },
];

http
  .createServer((req, res) => {
    const splitUrl = req.url.split("/");
    const filterData = [];
    if (splitUrl[2]) {
      const findPost = posts.find((d) => {
        if (d.id === +splitUrl[2]) {
          return d;
        }
      });
      if (findPost) {
        filterData.push(findPost);
      }
    }
    switch (req.url) {
      case "/":
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end("<div>Hello World! <a href=/posts />Posts</a></div>");
        break;
      case "/posts":
        res.setHeader("Content-Type", "application/json");
        res.writeHead(201);
        res.end(JSON.stringify(posts));
        break;
      case `/posts/${splitUrl[2]}`:
        res.setHeader("Content-Type", "application/json");
        res.writeHead(201);
        res.end(
          filterData.length > 0 ? JSON.stringify(filterData) : "no posts"
        );
        break;
      default:
        res.setHeader("Content-Type", "text/html");
        res.writeHead(404);
        res.end("<div>404 Page Not Found</div>");
        break;
    }
  })
  .listen(8080);
