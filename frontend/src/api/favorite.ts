import { request } from '@/utils/request';
import { FavoriteType } from '@/types/enums';
import type {
  CheckFavoriteResult,
  Favorite,
  ToggleFavoriteResult
} from '@/types/favorite';

export const favoriteApi = {
  toggle(data: { target_type: FavoriteType; target_id: string }) {
    return request.post<ToggleFavoriteResult>('/favorites', data);
  },
  myFavorites() {
    return request.get<Favorite[]>('/favorites/my');
  },
  check(target_type: FavoriteType, target_id: string) {
    return request.get<CheckFavoriteResult>(
      `/favorites/check?target_type=${target_type}&target_id=${target_id}`
    );
  }
};
