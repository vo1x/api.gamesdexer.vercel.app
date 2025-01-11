import express from "express";
import cors from "cors"; 
import routes from "./routes";

const app = express();

app.use(cors({ origin: "http://localhost:5173" })); 

app.use(express.json());
app.use("/", routes);

export default app;
