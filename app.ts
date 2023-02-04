import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import { transformPassword } from './helpers/cryptingPassword';
import { generateToken } from './helpers/generateToken';

/* 
connect to mongoDB
*/
let clientContainer: MongoClient = null;

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
connectToCluster();


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('PROCESS PORT: ', process.env.DB_URI);
  console.log(`🟢 Server is running at ${port}`)
});


app.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    // check exists fields
    if (!username || !email || !password) {
      return res.status(400).send({
        message: 'Invalid credentials'
      });
    }
    // check collection
    const collection = clientContainer.db('Database-zero').collection('auth');
    if (collection) {
      // control if user already exists
      const ifUserExists = await collection.findOne({ email });
      if (ifUserExists) {
        return res.status(409).send({
          message: "User Already Exist. Please Login"
        });
      }
      const response = await collection.insertOne({ username, email, password: transformPassword(password, 'encrypt') });
      if (response) {
        clientContainer.close();
        return res.status(200).send({
          message: 'Register successfully'
        });
      } else {
        return res.status(500).send({
          message: 'Error register user'
        });
      }
    } else {
      return res.status(404).send({
        message: 'Collection not found'
      });
    }
  } catch (error) {
    return res.status(500).send({
      message: 'Error register user'
    });
  }
});

app.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const collection = clientContainer.db('Database-zero').collection('auth');
    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email o password non corretti"
      });
    }
    if (transformPassword(user.password, 'decrypt') === password) {
      const [accessToken, refreshToken] = [
        generateToken(email, 'access', '2h'), 
        generateToken(email, 'refresh', '24h')
      ]
      clientContainer.close();
      return res.status(201).json({ 
        message: 'Login successfully', 
        payload: {
          accessToken, 
          refreshToken
        }
      });
    } else {
      return res.status(400).json({
        message: "Password non corretta"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Errore durante il login dell'utente");
  }
})