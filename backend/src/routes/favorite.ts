import { Router } from 'express';
import { favoriteController } from '../controllers/favorite.controller';
import { authMiddleware } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/', authMiddleware, asyncHandler(favoriteController.toggle));
router.get('/my', authMiddleware, asyncHandler(favoriteController.myFavorites));
router.get('/check', authMiddleware, asyncHandler(favoriteController.check));

export default router;
