const express = require("express");
// const { abortLaunch } = require("../../models/launches.model");
const {
  getAllLaunches,
  addNewLaunch,
  abortLaunch,
} = require("./launches.controller");
const launchesRouter = express.Router();
launchesRouter.get("/", getAllLaunches);
launchesRouter.post("/", addNewLaunch);
launchesRouter.delete("/:id", abortLaunch);
module.exports = launchesRouter;
