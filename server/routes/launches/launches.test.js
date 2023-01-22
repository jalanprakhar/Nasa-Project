const request = require("supertest");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const app = require("../../app");
describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });
  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });
  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test POST /launches", () => {
    const launchDataWithDate = {
      mission: "USS Enterprise",
      target: "Kepler-62 f",
      launchDate: "January 4, 2028",
      rocket: "NCC 1702-D",
    };
    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      target: "Kepler-62 f",
      rocket: "NCC 1702-D",
    };
    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      target: "Kepler-62 f",
      launchDate: "hello",
      rocket: "NCC 1702-D",
    };
    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithDate)
        .expect("Content-Type", /json/)
        .expect(201);
      expect(new Date(launchDataWithDate.launchDate).valueOf()).toBe(
        new Date(response.body.launchDate).valueOf()
      );
      expect(response.body).toMatchObject(launchDataWithoutDate);
    });
    test("It should catch missing values", async () => {
      const res = await request(app)
        .post("/v1/launches")
        .send({
          mission: "USS Enterprise",
          target: "Kepler-62 f",
          launchDate: "January 4, 2028",
        })
        .expect("Content-Type", /json/)
        .expect(401);

      expect(res.body).toStrictEqual({
        error: "Missing required inputs",
      });
    });
    test("It should identify wrong dates", async () => {
      const res = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate);
      expect(401);
      expect(res.body).toStrictEqual({
        error: "Date format not correct",
      });
    });
  });
});
