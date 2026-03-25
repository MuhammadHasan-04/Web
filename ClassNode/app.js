import express from "express";
import sessionRoutes from "./routes/session.js";

import session from "express-session";

const app = express();

app.use(
  session({
    secret: "gggggghhhhhh", // Secret key for signing the session ID
    resave: false, // Prevents resaving session if nothing has changed
    saveUninitialized: false, // Prevents saving uninitialized sessions
  }),
);
app.get("/", (req, res) => {
  res.send("Hello from Express in WSL!");
});

app.use("/session", sessionRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
