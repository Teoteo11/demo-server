import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

let clientContainer: MongoClient = null;
/* 
  connect to mongoDB
*/
const connectToCluster = async () => {
  try {
      const client = new MongoClient(process.env.DB_URI);
      console.log('🟢 Connecting to MongoDB Atlas cluster...');
      clientContainer = client;
      await client.connect();
      console.log('🟢 Successfully connected to MongoDB Atlas!');
      return client;
  } catch (error) {
      console.error('🔴 Connection to MongoDB Atlas failed!', error);
      process.exit();
  }
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
config();
connectToCluster()


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('PROCESS PORT: ', process.env.DB_URI);
  console.log(`🟢 Server is running at ${port}`)
});


app.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send('Invalid credentials');
    }
    const collection = await clientContainer.db('Database-zero').collection('auth');
    if (collection) {
      const response = await collection.insertOne({username, password});
      if (response) {
        clientContainer.close();
        return res.status(200).send('Register successfully');
      } else {
        return res.status(500).send('Error register user');
      }
    } else {
      return res.status(404).send('Collection not found');
    }
  } catch (error) {
    return res.status(500).send('Error register user');
  }
});