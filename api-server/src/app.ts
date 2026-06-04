import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import placesRouter from "./routes/places";
import planRouter from "./routes/plan";
import healthRouter from "./routes/health";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/health", healthRouter);
app.use("/api/places", placesRouter);
app.use("/api/plan", planRouter);

app.listen(PORT, () => {
  console.log(`🪺 Nested API running on http://localhost:${PORT}`);
});

export default app;
