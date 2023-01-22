const express = require("express");
const planetRouter = express.Router();
const { getAllPlanets } = require("./planets.controller");
planetRouter.get("/", getAllPlanets);
module.exports = planetRouter;
