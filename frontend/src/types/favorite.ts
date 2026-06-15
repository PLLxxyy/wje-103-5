import type { FavoriteType } from './enums';
import type { GroupBuy } from './groupbuy';
import type { Shop } from './shop';

export type Favorite = {
  id: string;
  user_id: string;
  target_type: FavoriteType;
  target_id: string;
  created_at: string;
  groupBuy?: GroupBuy;
  shop?: Shop;
};

export type ToggleFavoriteResult = {
  favorited: boolean;
};

export type CheckFavoriteResult = {
  favorited: boolean;
};
