import expressLoader from './express.js';
import mongooseLoader from './mongoose.js';

export default async (app) => {
  // Load MongoDB connection
  await mongooseLoader();
  console.log('✅ MongoDB loader initialized');
  
  // Load Express app
  expressLoader(app);
  console.log('✅ Express loader initialized');
  
};
