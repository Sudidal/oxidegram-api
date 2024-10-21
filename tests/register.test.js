import app from "../app.js";
import supertest from "supertest";
import { resetDb } from "../utils/resetDb.js";

beforeAll(async () => {
  await resetDb();
});

describe("Account Register Works Fine", () => {
  test("Should register account", (done) => {
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
  test("Validation works, No duplicate username & email", (done) => {
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
      .expect(400, done);
  });
});
