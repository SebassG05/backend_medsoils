import expressLoader from './express.js';
import mongooseLoader from './mongoose.js';

export default async (app) => {
  // Load MongoDB connection
  await mongooseLoader();
  
  // Load Express app
  expressLoader(app);
  console.log('✅ Servidor configurado correctamente');
  
};
