import express from "express";
import { baseRouter } from "../routers/baseRouter.js";
import supertest from "supertest";

const app = express();
app.use("/", baseRouter);

test("base router is prefect", (done) => {
  supertest(app)
    .get("/")
    .expect("Content-Type", /json/)
    .expect({ message: "You are in the index route" })
    .expect(200, done);
});
