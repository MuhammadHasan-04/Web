import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  req.session.name = "hello";
  req.session.ban = true;
  res.send("Session data set.");
});

router.get("/sessions", (req, res) => {
  console.log(req.session);
  res.send(`Session Data: ${JSON.stringify(req.session)}`);
});

export default router;
