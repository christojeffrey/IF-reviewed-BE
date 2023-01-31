import { getNIM, getHello, postFormNIM } from "../controllers";

const app = require("express")();

app.get("/api", getHello);
app.get("/api/:NIM", getNIM);
app.post("/api/form/:NIM", postFormNIM);

module.exports = app;
