const express = require("express");

const planetRouter = require("./planets/planets.router");
const launchesRouter = require("./launches/launches.router");
const apiRouter = express.Router();
apiRouter.use("/planets", planetRouter);
apiRouter.use("/launches", launchesRouter);
module.exports = apiRouter;
