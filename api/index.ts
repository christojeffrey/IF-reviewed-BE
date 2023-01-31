import getHello from "../controllers/hello";

const app = require("express")();

app.get("/api", (req: any, res: any) => {
  res.end(`Hello world!`);
});

app.get("/api/hello", getHello);

module.exports = app;
