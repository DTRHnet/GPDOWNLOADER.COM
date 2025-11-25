import { router } from '../trpc';
import { searchRouter } from './search';
import { tabsRouter } from './tabs';
import { favoritesRouter } from './favorites';
import { ratingsRouter } from './ratings';
import { commentsRouter } from './comments';
import { uploadsRouter } from './uploads';
import { adminRouter } from './admin';
import { adsRouter } from './ads';

export const appRouter = router({
  search: searchRouter,
  tabs: tabsRouter,
  favorites: favoritesRouter,
  ratings: ratingsRouter,
  comments: commentsRouter,
  uploads: uploadsRouter,
  admin: adminRouter,
  ads: adsRouter,
});

export type AppRouter = typeof appRouter;
