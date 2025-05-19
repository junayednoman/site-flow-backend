import express from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import routeNotFound from "./app/middlewares/routeNotFound";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: ["http://192.168.10.159:5011", "http://localhost:5011"],
  credentials: true
}));
app.use(express.json());
// Use cookie-parser middleware
app.use(cookieParser());
app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.json({ message: "🏗️ Hello from site-flow server!" });
});

// handle global errors
app.use(globalErrorHandler);

// handle api route not found
app.use(routeNotFound);

export default app;
