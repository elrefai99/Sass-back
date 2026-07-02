import "../config/dotenv"
import { logger } from "../utils/logger";
import mongoose from "mongoose";

async function connectMongoDB() {
     try {
          const uri = process.env.MONGODB_URI as string
          await mongoose.connect(uri);
     } catch (err) {
          console.error("❌ MongoDB connection error in workers:", err);
          process.exit(1);
     }
}
process.on('SIGTERM', async () => {
     console.log('SIGTERM received, closing MongoDB connection...');
     await mongoose.disconnect();
     process.exit(0);
});

process.on('SIGINT', async () => {
     console.log('SIGINT received, closing MongoDB connection...');
     await mongoose.disconnect();
     process.exit(0);
});


const startWorkerServer = async () => {
     try {
          await Promise.all([
               connectMongoDB(),
          ]).then(() => {
               require('./worker.emails');
               require('./worker.notifications');
               console.log('⛁  Success connected with MongoDB of SRVJ for workers');
               console.log('🚀 All workers started successfully!');
          })
     } catch (error: any) {
          logger.error({
               message: 'Failed to start server',
               error: error?.message,
               stack: error?.stack,
          })
          process.exit(1)
     }
}
startWorkerServer()
