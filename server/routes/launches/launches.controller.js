const launchesModel = require("../../models/launches.model");
const { getPagination } = require("../../services/query");
async function getAllLaunches(req, res) {
  const query = getPagination(req.query);
  // console.log(query);
  return res.status(200).send(await launchesModel.getAllLaunches(query));
}
async function addNewLaunch(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.target ||
    !launch.launchDate
  ) {
    return res.status(401).json({
      error: "Missing required inputs",
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(401).json({
      error: "Date format not correct",
    });
  }
  await launchesModel.scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}
async function abortLaunch(req, res) {
  const launchId = +req.params.id;
  const existsLaunch = await launchesModel.hasLaunch(launchId);
  if (!existsLaunch) {
    return res.status(404).json({ error: "Launch not found" });
  }
  const result = await launchesModel.abortLaunch(launchId);
  if (!result) {
    return res.status(400).send({ error: "Launch not aborted" });
  }
  res.status(200).send({ ok: true });
}
module.exports = {
  getAllLaunches,
  addNewLaunch,
  abortLaunch,
};
