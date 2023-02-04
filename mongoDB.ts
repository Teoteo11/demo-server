import { MongoClient } from "mongodb";

export const connectToCluster = async (client: MongoClient) => {
  try {
      client = new MongoClient(process.env.DB_URI);
      console.log('🟢 Connecting to MongoDB Atlas cluster...');
      await client.connect();
      console.log('🟢 Successfully connected to MongoDB Atlas!');
      return client;
  } catch (error) {
      console.error('🔴 Connection to MongoDB Atlas failed!', error);
      process.exit();
  }
}
