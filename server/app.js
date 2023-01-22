const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const apiRouter = require("./routes/api");
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/v1", apiRouter);
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
module.exports = app;
