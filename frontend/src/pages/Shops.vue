<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import GroupBuyCard from '@/components/common/GroupBuyCard.vue';
import { useShopStore } from '@/stores/useShopStore';
import { useFavoriteStore } from '@/stores/useFavoriteStore';
import { useAuth } from '@/hooks/useAuth';
import { FavoriteType } from '@/types/enums';
import { formatPrice } from '@/utils/format';

const router = useRouter();
const auth = useAuth();
const shopStore = useShopStore();
const favoriteStore = useFavoriteStore();
const selectedId = ref('');
const favoritedMap = ref<Record<string, boolean>>({});

const selectedShop = computed(() => shopStore.current ?? shopStore.list.find((shop) => shop.id === selectedId.value));

const selectShop = async (id: string) => {
  selectedId.value = id;
  await shopStore.fetchDetail(id);
};

const toggleFavorite = async (e: Event, shopId: string) => {
  e.preventDefault();
  e.stopPropagation();
  if (!auth.currentUser.value) {
    router.push('/login');
    return;
  }
  const result = await favoriteStore.toggle(FavoriteType.SHOP, shopId);
  favoritedMap.value[shopId] = result.favorited;
};

const isFavorited = (shopId: string) => {
  if (favoritedMap.value[shopId] !== undefined) {
    return favoritedMap.value[shopId];
  }
  return favoriteStore.isFavorited(FavoriteType.SHOP, shopId);
};

onMounted(async () => {
  await shopStore.fetchList();
  if (shopStore.list[0]) {
    await selectShop(shopStore.list[0].id);
  }
});
</script>

<template>
  <main class="page shops-page">
    <section class="section-title">
      <div>
        <h2>甜品店铺</h2>
        <p class="muted">看甜品和团购记录</p>
      </div>
    </section>

    <section class="shop-strip">
      <button
        v-for="shop in shopStore.list"
        :key="shop.id"
        type="button"
        :class="{ active: selectedId === shop.id }"
        @click="selectShop(shop.id)"
      >
        <div class="shop-cover">
          <img :src="shop.logo || ''" :alt="shop.name" />
          <button
            class="favorite-btn"
            :class="{ active: isFavorited(shop.id) }"
            type="button"
            @click="toggleFavorite($event, shop.id)"
          >
            <van-icon :name="isFavorited(shop.id) ? 'star' : 'star-o'" size="14" />
          </button>
        </div>
        <span>{{ shop.name }}</span>
      </button>
    </section>

    <section v-if="selectedShop" class="section shop-hero">
      <div class="shop-hero-cover">
        <img :src="selectedShop.logo || ''" :alt="selectedShop.name" />
        <button
          class="favorite-btn"
          :class="{ active: isFavorited(selectedShop.id) }"
          type="button"
          @click="toggleFavorite($event, selectedShop.id)"
        >
          <van-icon :name="isFavorited(selectedShop.id) ? 'star' : 'star-o'" size="20" />
        </button>
      </div>
      <div>
        <h1>{{ selectedShop.name }}</h1>
        <p>{{ selectedShop.description }}</p>
        <span>{{ selectedShop.address }} · {{ selectedShop.contact_phone }}</span>
      </div>
    </section>

    <section v-if="selectedShop" class="section panel">
      <div class="section-title">
        <h2>甜品</h2>
        <span class="muted">{{ selectedShop.dessertItems?.length || 0 }} 款</span>
      </div>
      <div class="dessert-grid">
        <article v-for="item in selectedShop.dessertItems" :key="item.id">
          <img :src="item.image || ''" :alt="item.name" />
          <div>
            <strong>{{ item.name }}</strong>
            <span>{{ item.category }}</span>
            <p>{{ item.description }}</p>
            <em>{{ formatPrice(item.price) }}</em>
          </div>
        </article>
      </div>
    </section>

    <section v-if="selectedShop" class="section">
      <div class="section-title">
        <h2>团购记录</h2>
        <span class="muted">{{ selectedShop.groupBuys?.length || 0 }} 场</span>
      </div>
      <div class="stack">
        <GroupBuyCard
          v-for="item in selectedShop.groupBuys"
          :key="item.id"
          :group-buy="item"
          compact
        />
        <van-empty v-if="!selectedShop.groupBuys?.length" description="暂无团购记录" />
      </div>
    </section>
  </main>
</template>

<style scoped>
.section-title p {
  margin: 4px 0 0;
}

.shop-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 2px 0 6px;
}

.shop-strip button {
  flex: 0 0 116px;
  display: grid;
  gap: 8px;
  padding: 8px;
  border: 1px solid #ead8c7;
  border-radius: 8px;
  color: #3b2a22;
  background: #fffaf4;
  text-align: left;
}

.shop-strip button.active {
  border-color: #e35d6a;
  background: #fff1f2;
}

.shop-cover {
  position: relative;
}

.shop-cover img {
  width: 100%;
  aspect-ratio: 1.25;
  object-fit: cover;
  border-radius: 8px;
}

.favorite-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
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

.shop-strip span {
  font-size: 13px;
  font-weight: 700;
}

.shop-hero {
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: #fffaf4;
  border: 1px solid #ead8c7;
}

.shop-hero-cover {
  position: relative;
}

.shop-hero-cover img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
}

.shop-hero-cover .favorite-btn {
  top: 6px;
  right: 6px;
  width: 32px;
  height: 32px;
}

.shop-hero h1 {
  margin: 0 0 8px;
  font-size: 22px;
  line-height: 1.2;
}

.shop-hero p {
  margin: 0 0 8px;
  color: #4d382d;
  line-height: 1.55;
}

.shop-hero span {
  color: #826d60;
  font-size: 12px;
}

.dessert-grid {
  display: grid;
  gap: 12px;
}

.dessert-grid article {
  display: grid;
  grid-template-columns: 94px minmax(0, 1fr);
  gap: 12px;
}

.dessert-grid img {
  width: 94px;
  height: 94px;
  object-fit: cover;
  border-radius: 8px;
}

.dessert-grid div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.dessert-grid span {
  color: #2f8d76;
  font-size: 12px;
  font-weight: 700;
}

.dessert-grid p {
  margin: 0;
  color: #826d60;
  font-size: 13px;
  line-height: 1.45;
}

.dessert-grid em {
  color: #d94f5d;
  font-style: normal;
  font-weight: 800;
}
</style>
