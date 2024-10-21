import app from "./app.js";

app.listen(PORT, () => {
  console.log(
    "Server listening on port: " +
      PORT +
      "\n\x1b[32m" +
      "http://localhost:" +
      PORT +
      "\x1b[0m"
  );
});
