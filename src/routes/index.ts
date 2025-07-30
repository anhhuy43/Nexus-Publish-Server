import { Express } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import contentRoutes from './contentRoutes';

function route(app: Express) {
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/content', contentRoutes);
}

export default route;
