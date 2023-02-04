import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { connectToCluster } from './mongoDB';

const app = express();
app.use(cors());
config();
connectToCluster(process.env.DB_URI);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`🟢 Server is running at ${port}`));