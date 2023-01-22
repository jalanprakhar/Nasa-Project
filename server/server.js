const http = require("http");
require("dotenv").config();
const app = require("./app");
const server = http.createServer(app);
const { loadPlanetData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");
const { mongoConnect } = require("./services/mongo");

const PORT = process.env.PORT || 8000;
async function loadServer() {
  await mongoConnect();
  await loadPlanetData();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}
loadServer();
