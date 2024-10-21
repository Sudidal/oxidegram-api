import express from "express";
import { baseRouter } from "../routers/baseRouter.js";
import supertest from "supertest";
import { resetDb } from "../utils/resetDb.js";

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use("/", baseRouter);

beforeAll(async () => {
  await resetDb();
});

test("Account register works", (done) => {
  supertest(app)
    .post("/register")
    .type("form")
    .send({
      username: "oxide",
      email: "mohammed@gmail.com",
      password: "qwerty",
      confirm_password: "qwerty",
    })
    .expect("Content-Type", /json/)
    .expect({ message: "Account registered successfully" })
    .expect(200, done);
});
