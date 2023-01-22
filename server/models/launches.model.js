const launchesDatabase = require("./launches.mongo");
const axios = require("axios");
// const launchesDatabase = new Map();
const planetsDatabase = require("./planets.mongo");
const DEFAULT_FLIGHT_NUMBER = 100;

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
async function populateLaunches() {
  console.log("Downloading data");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status != 200) {
    console.log("Problem downloading launch data");
    throw new Error("Loading Launchdata failed");
  }
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payLoads = launchDoc["payloads"];
    const customers = payLoads.flatMap((payLoad) => {
      return payLoad["customers"];
    });
    const l = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
    saveLaunch(l);
  }
}
async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("FirstLaunch already loaded");
    return;
  }
  await populateLaunches();
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase
    .findOne({})
    .sort({ flightNumber: -1 });
  if (!latestLaunch) return DEFAULT_FLIGHT_NUMBER;
  return latestLaunch.flightNumber;
}
async function getAllLaunches(query) {
  return await launchesDatabase
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .sort({ flightNumber: 1 })
    .skip(query.skip)
    .limit(query.limit);
}

async function scheduleNewLaunch(launch) {
  const planet = await planetsDatabase.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planets were found");
  }
  let curFlightNumber = await getLatestFlightNumber();
  curFlightNumber++;
  const newLaunch = Object.assign(launch, {
    flightNumber: curFlightNumber,
    success: true,
    upcoming: true,
    customers: ["ZTM", "NASA"],
  });
  await saveLaunch(newLaunch);
}

async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  );
}
async function hasLaunch(id) {
  return await findLaunch({ flightNumber: id });
}
async function abortLaunch(id) {
  const abort = await launchesDatabase.updateOne(
    { flightNumber: id },
    { upcoming: false, success: false }
  );
  return abort.modifiedCount === 1;
  // return abortedLaunch;
}
module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  hasLaunch,
  abortLaunch,
  loadLaunchData,
};
