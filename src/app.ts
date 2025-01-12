import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();

const allowedOrigins = [
  "https://apidexer.vercel.app",
  "https://gamesdexer.netlify.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use("/", routes);

export default app;
