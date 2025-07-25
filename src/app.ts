import express from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import routeNotFound from "./app/middlewares/routeNotFound";
import cookieParser from "cookie-parser";
import stripeWebhookRouter from "./app/modules/stripeWebhook/stripeWebhook.routes";
const app = express();

app.use(cors({
  origin: ["http://10.10.10.17:3000", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.use('/api/v1/stripe', stripeWebhookRouter);

app.use(express.json());
// Use cookie-parser middleware
app.use(cookieParser());
app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("🏗️ Hello from site-flow server!");
});

// handle global errors
app.use(globalErrorHandler);

// handle api route not found
app.use(routeNotFound);

export default app;
