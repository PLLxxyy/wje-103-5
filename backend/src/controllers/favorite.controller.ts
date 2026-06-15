import type { Request, Response } from 'express';
import { favoriteService } from '../services/favorite.service';
import { FavoriteType } from '../types/enums';
import { success } from '../utils/response';

export const favoriteController = {
  async toggle(req: Request, res: Response) {
    const result = await favoriteService.toggle(req.body, req.user!.id);
    success(res, result, result.favorited ? '收藏成功' : '已取消收藏');
  },

  async myFavorites(req: Request, res: Response) {
    const records = await favoriteService.myFavorites(req.user!.id);
    success(res, records);
  },

  async check(req: Request, res: Response) {
    const { target_type, target_id } = req.query;
    const result = await favoriteService.check(
      req.user!.id,
      target_type as FavoriteType,
      String(target_id)
    );
    success(res, result);
  }
};
