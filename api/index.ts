import { getNIM, getHello } from "../controllers";

const app = require("express")();

app.get("/api", getHello);
app.get("/api/:NIM", getNIM);

module.exports = app;
