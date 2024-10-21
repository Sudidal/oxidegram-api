import app from "../app.js";
import supertest from "supertest";
import { resetDb } from "../utils/resetDb.js";

beforeAll(async () => {
  await resetDb();
  await supertest(app).post("/register").type("form").send({
    username: "oxide",
    email: "mohammed@gmail.com",
    password: "qwerty",
    confirm_password: "qwerty",
  });
});

describe("Login Works Fine", () => {
  test("Should login", (done) => {
    supertest(app)
      .post("/login")
      .type("form")
      .send({
        username: "oxide",
        password: "qwerty",
      })
      .expect(200)
      .expect("Content-Type", /json/)
      .expect({ message: "Login successfull" }, done);
  });
  test("Should not login", (done) => {
    supertest(app)
      .post("/login")
      .type("form")
      .send({
        username: "oxide",
        password: "qwerty WHOPS",
      })
      .expect(401)
      .expect("Content-Type", /json/, done);
  });
});
