import { FavoriteType } from '../types/enums';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/response';

const groupBuyInclude = {
  shop: true,
  leader: {
    select: {
      id: true,
      nickname: true,
      phone: true,
      avatar: true,
      role: true,
      created_at: true
    }
  },
  pickupPoints: true,
  joinRecords: true,
  voteOptions: {
    include: {
      voteRecords: true
    }
  }
};

const shopInclude = {
  dessertItems: true,
  groupBuys: {
    include: {
      shop: true,
      leader: {
        select: {
          id: true,
          nickname: true,
          phone: true,
          avatar: true,
          role: true,
          created_at: true
        }
      },
      joinRecords: true,
      pickupPoints: true,
      voteOptions: true
    }
  }
};

export type ToggleFavoriteInput = {
  target_type: FavoriteType;
  target_id: string;
};

export const favoriteService = {
  async toggle(input: ToggleFavoriteInput, userId: string) {
    if (!input.target_type || !input.target_id?.trim()) {
      throw new AppError('收藏类型和目标ID不能为空');
    }

    if (input.target_type === FavoriteType.GROUPBUY) {
      const groupBuy = await prisma.groupBuy.findUnique({ where: { id: input.target_id } });
      if (!groupBuy) {
        throw new AppError('团购不存在', 404);
      }
    } else if (input.target_type === FavoriteType.SHOP) {
      const shop = await prisma.shop.findUnique({ where: { id: input.target_id } });
      if (!shop) {
        throw new AppError('店铺不存在', 404);
      }
    } else {
      throw new AppError('无效的收藏类型');
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        user_id_target_type_target_id: {
          user_id: userId,
          target_type: input.target_type,
          target_id: input.target_id
        }
      }
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      return { favorited: false };
    }

    await prisma.favorite.create({
      data: {
        user_id: userId,
        target_type: input.target_type,
        target_id: input.target_id
      }
    });
    return { favorited: true };
  },

  async myFavorites(userId: string) {
    const records = await prisma.favorite.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    const groupBuyIds = records.filter((r) => r.target_type === FavoriteType.GROUPBUY).map((r) => r.target_id);
    const shopIds = records.filter((r) => r.target_type === FavoriteType.SHOP).map((r) => r.target_id);

    const [groupBuys, shops] = await Promise.all([
      groupBuyIds.length
        ? prisma.groupBuy.findMany({
            where: { id: { in: groupBuyIds } },
            include: groupBuyInclude
          })
        : [],
      shopIds.length
        ? prisma.shop.findMany({
            where: { id: { in: shopIds } },
            include: shopInclude
          })
        : []
    ]);

    const groupBuyMap = new Map(groupBuys.map((gb) => [gb.id, gb]));
    const shopMap = new Map(shops.map((s) => [s.id, s]));

    return records.map((record) => ({
      ...record,
      groupBuy: record.target_type === FavoriteType.GROUPBUY ? groupBuyMap.get(record.target_id) : undefined,
      shop: record.target_type === FavoriteType.SHOP ? shopMap.get(record.target_id) : undefined
    }));
  },

  async check(userId: string, targetType: FavoriteType, targetId: string) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        user_id_target_type_target_id: {
          user_id: userId,
          target_type: targetType,
          target_id: targetId
        }
      }
    });
    return { favorited: !!favorite };
  }
};
