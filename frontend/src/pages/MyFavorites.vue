<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import GroupBuyCard from '@/components/common/GroupBuyCard.vue';
import { useAuth } from '@/hooks/useAuth';
import { useFavoriteStore } from '@/stores/useFavoriteStore';
import { FavoriteType } from '@/types/enums';

const router = useRouter();
const auth = useAuth();
const favoriteStore = useFavoriteStore();
const activeTab = ref<'all' | FavoriteType>('all');

const tabOptions = [
  { label: '全部', value: 'all' as const },
  { label: '团购', value: FavoriteType.GROUPBUY },
  { label: '店铺', value: FavoriteType.SHOP }
];

const filteredList = computed(() => {
  if (activeTab.value === 'all') return favoriteStore.list;
  return favoriteStore.list.filter((f) => f.target_type === activeTab.value);
});

const groupBuyCount = computed(() => favoriteStore.groupBuyIds.length);
const shopCount = computed(() => favoriteStore.shopIds.length);

onMounted(() => {
  favoriteStore.fetchList();
});
</script>

<template>
  <main class="page my-page">
    <section class="profile-band">
      <img :src="auth.currentUser.value?.avatar || ''" :alt="auth.currentUser.value?.nickname" />
      <div>
        <h1>{{ auth.currentUser.value?.nickname }}</h1>
        <p>{{ auth.currentUser.value?.phone }} · {{ auth.currentUser.value?.role }}</p>
      </div>
    </section>

    <section class="section summary-grid">
      <div class="panel">
        <span>收藏</span>
        <strong>{{ favoriteStore.list.length }}</strong>
      </div>
      <div class="panel">
        <span>团购</span>
        <strong>{{ groupBuyCount }}</strong>
      </div>
      <div class="panel">
        <span>店铺</span>
        <strong>{{ shopCount }}</strong>
      </div>
    </section>

    <section class="section">
      <div class="filter-row">
        <button
          v-for="option in tabOptions"
          :key="option.value"
          type="button"
          :class="{ active: activeTab === option.value }"
          @click="activeTab = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section class="section stack">
      <template v-for="item in filteredList" :key="item.id">
        <article v-if="item.groupBuy" class="favorite-card">
          <GroupBuyCard :group-buy="item.groupBuy" compact />
        </article>
        <article v-if="item.shop" class="favorite-card shop-card">
          <div
            class="shop-item"
            type="button"
            @click="router.push(`/shops?shopId=${item.shop!.id}`)"
          >
            <div class="shop-cover">
              <img :src="item.shop.logo || ''" :alt="item.shop.name" />
            </div>
            <div class="shop-info">
              <strong>{{ item.shop.name }}</strong>
              <p>{{ item.shop.description }}</p>
              <span>{{ item.shop.address }}</span>
              <div class="shop-meta">
                <span>{{ item.shop.dessertItems?.length || 0 }} 款甜品</span>
                <span>{{ item.shop.groupBuys?.length || 0 }} 场团购</span>
              </div>
            </div>
          </div>
        </article>
      </template>
      <van-empty v-if="!favoriteStore.loading && filteredList.length === 0" description="暂无收藏" />
    </section>
  </main>
</template>

<style scoped>
.profile-band {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  color: #fff8f2;
  background:
    linear-gradient(120deg, rgba(46, 29, 22, 0.72), rgba(46, 29, 22, 0.28)),
    url("https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=80") center/cover;
}

.profile-band img {
  width: 72px;
  height: 72px;
  border: 2px solid rgba(255, 248, 242, 0.78);
  border-radius: 50%;
  object-fit: cover;
}

.profile-band h1 {
  margin: 0 0 6px;
  font-size: 24px;
  letter-spacing: 0;
}

.profile-band p {
  margin: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.summary-grid .panel {
  display: grid;
  gap: 4px;
}

.summary-grid span {
  color: #826d60;
  font-size: 12px;
}

.summary-grid strong {
  color: #d94f5d;
  font-size: 24px;
}

.filter-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.filter-row button {
  flex: 0 0 auto;
  min-height: 36px;
  padding: 0 13px;
  border: 1px solid #ead8c7;
  border-radius: 999px;
  color: #62483b;
  background: #fffaf4;
}

.filter-row button.active {
  border-color: #e35d6a;
  color: #fff8f2;
  background: #e35d6a;
}

.favorite-card {
  padding: 0;
  border: 1px solid #ead8c7;
  border-radius: 8px;
  background: #fffaf4;
  overflow: hidden;
}

.shop-item {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  cursor: pointer;
}

.shop-cover {
  position: relative;
  min-height: 108px;
}

.shop-cover img {
  width: 100%;
  height: 108px;
  object-fit: cover;
  border-radius: 8px;
}

.shop-info {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.shop-info strong {
  color: #33221b;
  font-size: 16px;
}

.shop-info p {
  margin: 0;
  color: #4d382d;
  font-size: 13px;
  line-height: 1.45;
}

.shop-info > span {
  color: #826d60;
  font-size: 12px;
}

.shop-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.shop-meta span {
  color: #7c6a5d;
  font-size: 12px;
}
</style>
