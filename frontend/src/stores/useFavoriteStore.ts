import { defineStore } from 'pinia';
import { favoriteApi } from '@/api/favorite';
import { FavoriteType } from '@/types/enums';
import type { Favorite } from '@/types/favorite';

type FavoriteState = {
  list: Favorite[];
  loading: boolean;
  checkedMap: Record<string, boolean>;
};

export const useFavoriteStore = defineStore('favorite', {
  state: (): FavoriteState => ({
    list: [],
    loading: false,
    checkedMap: {}
  }),
  getters: {
    groupBuyIds: (state) =>
      state.list.filter((f) => f.target_type === FavoriteType.GROUPBUY).map((f) => f.target_id),
    shopIds: (state) =>
      state.list.filter((f) => f.target_type === FavoriteType.SHOP).map((f) => f.target_id)
  },
  actions: {
    async toggle(targetType: FavoriteType, targetId: string) {
      const result = await favoriteApi.toggle({
        target_type: targetType,
        target_id: targetId
      });
      const key = `${targetType}:${targetId}`;
      this.checkedMap[key] = result.favorited;
      if (result.favorited) {
        await this.fetchList();
      } else {
        this.list = this.list.filter(
          (f) => !(f.target_type === targetType && f.target_id === targetId)
        );
      }
      return result;
    },
    async fetchList() {
      this.loading = true;
      try {
        this.list = await favoriteApi.myFavorites();
        this.list.forEach((f) => {
          this.checkedMap[`${f.target_type}:${f.target_id}`] = true;
        });
        return this.list;
      } finally {
        this.loading = false;
      }
    },
    async check(targetType: FavoriteType, targetId: string) {
      const key = `${targetType}:${targetId}`;
      if (this.checkedMap[key] !== undefined) {
        return { favorited: this.checkedMap[key] };
      }
      const result = await favoriteApi.check(targetType, targetId);
      this.checkedMap[key] = result.favorited;
      return result;
    },
    isFavorited(targetType: FavoriteType, targetId: string) {
      const key = `${targetType}:${targetId}`;
      return this.checkedMap[key] ?? false;
    }
  }
});
