import express from "express";
import { config } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

// API Routes
app.use("/api", routes);

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server started successfully on port ${config.port}`);
});