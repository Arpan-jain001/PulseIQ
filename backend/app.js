import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS (Render + Local Support)
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Test Route
app.get("/", (req, res) => {
  res.send("👋 Hello Duniya 🌍🔥 Welcome to PulseIQ Backend 🚀");
});

export default app;
