<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import type { GroupBuy } from '@/types/groupbuy';
import { formatPrice } from '@/utils/format';
import CountdownTimer from './CountdownTimer.vue';
import StatusBadge from './StatusBadge.vue';
import { useFavoriteStore } from '@/stores/useFavoriteStore';
import { FavoriteType } from '@/types/enums';
import { useAuth } from '@/hooks/useAuth';

const props = defineProps<{
  groupBuy: GroupBuy;
  compact?: boolean;
}>();

const router = useRouter();
const auth = useAuth();
const favoriteStore = useFavoriteStore();
const favorited = ref(false);

const joinedQuantity = computed(() =>
  (props.groupBuy.joinRecords ?? []).reduce((sum, record) => sum + Number(record.quantity), 0)
);
const progress = computed(() => Math.min(100, Math.round((joinedQuantity.value / props.groupBuy.min_quantity) * 100)));
const cover = computed(() => props.groupBuy.shop?.logo || 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80');

onMounted(() => {
  if (auth.currentUser.value) {
    favorited.value = favoriteStore.isFavorited(FavoriteType.GROUPBUY, props.groupBuy.id);
  }
});

const toggleFavorite = async (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  if (!auth.currentUser.value) {
    router.push('/login');
    return;
  }
  const result = await favoriteStore.toggle(FavoriteType.GROUPBUY, props.groupBuy.id);
  favorited.value = result.favorited;
};
</script>

<template>
  <RouterLink class="group-card" :class="{ compact }" :to="`/groupbuy/${groupBuy.id}`">
    <div class="cover" :style="{ backgroundImage: `url(${cover})` }">
      <button
        class="favorite-btn"
        :class="{ active: favorited }"
        type="button"
        @click="toggleFavorite"
      >
        <van-icon :name="favorited ? 'star' : 'star-o'" :size="compact ? 16 : 18" />
      </button>
    </div>
    <div class="content">
      <div class="title-row">
        <h3>{{ groupBuy.title }}</h3>
        <StatusBadge :status="groupBuy.status" />
      </div>
      <p class="shop-line">{{ groupBuy.shop?.name || '甜品店铺' }} · 团长 {{ groupBuy.leader?.nickname || '社区团长' }}</p>
      <div class="price-row">
        <strong>{{ formatPrice(groupBuy.group_price) }}</strong>
        <span>{{ formatPrice(groupBuy.original_price) }}</span>
      </div>
      <div class="meta-row">
        <span>已接 {{ joinedQuantity }}/{{ groupBuy.min_quantity }}</span>
        <CountdownTimer :deadline="groupBuy.deadline" quiet />
      </div>
      <van-progress :percentage="progress" :show-pivot="false" color="#e35d6a" track-color="#f3e3d2" />
    </div>
  </RouterLink>
</template>

<style scoped>
.group-card {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  color: inherit;
  text-decoration: none;
  background: #fffaf4;
  border: 1px solid #eedccb;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(83, 50, 36, 0.08);
}

.group-card.compact {
  grid-template-columns: 86px minmax(0, 1fr);
}

.cover {
  position: relative;
  min-height: 116px;
  border-radius: 8px;
  background-position: center;
  background-size: cover;
}

.favorite-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: #fff;
  background: rgba(46, 29, 22, 0.55);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.favorite-btn.active {
  color: #ffd166;
  background: rgba(46, 29, 22, 0.7);
}

.content {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.title-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-content: space-between;
}

h3 {
  margin: 0;
  color: #33221b;
  font-size: 16px;
  line-height: 1.35;
}

.shop-line,
.meta-row {
  margin: 0;
  color: #7c6a5d;
  font-size: 12px;
}

.price-row,
.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.price-row strong {
  color: #d94f5d;
  font-size: 20px;
}

.price-row span {
  color: #9a8a7d;
  font-size: 12px;
  text-decoration: line-through;
}
</style>
