import mongoose,{Mongoose} from 'mongoose';
const MONGODB_URL=process.env.MONGODB_URL;


interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  }
  //we have to connect the mongodb on which api requets .Nextjs is a serverless backend .They are stateless meaning they start to handle our request but shut do shut down right after.Thsi approach ebsures us to handle each  requets  to handle  independlty 
  //optimising by caching

  let cached: MongooseConnection = (global as any).mongoose

if(!cached) {
  cached = (global as any).mongoose = { 
    conn: null, promise: null 
  }
}

export const connectToDatabase = async () => {
  if(cached.conn) return cached.conn;

  if(!MONGODB_URL) throw new Error('Missing MONGODB_URL');

  cached.promise = 
    cached.promise || 
    mongoose.connect(MONGODB_URL, { 
      dbName: 'craft-tech', bufferCommands: false 
    })

  cached.conn = await cached.promise;

  return cached.conn;
}