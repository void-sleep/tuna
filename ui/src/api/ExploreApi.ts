export interface Scenario {
  id: string;
  title: string;
  description: string;
  iconType: string;
  color: string;
}

export interface Collection {
  id: string;
  title: string;
  description?: string;
  count: number;
  creatorId?: string;
  creatorName?: string;
  items?: string[];
}

export interface Policy {
  id: string;
  title: string;
  description?: string;
  type: 'random' | 'weighted' | 'sorting' | 'exclusion' | 'custom';
  creatorId?: string;
  creatorName?: string;
}

export interface PopularApplication {
  id: string;
  title: string;
  description?: string;
  creator: string;
  likes: number;
  category?: string;
}

export class ExploreApi {
  /**
   * Get recommended scenarios for the explore page
   */
  static getRecommendedScenarios(): Scenario[] {
    return [
      {
        id: '1',
        title: '中午吃什么',
        description: '摇出你的食谱，多人摇再根据石头、剪刀、布确定胜负。',
        iconType: 'restaurant',
        color: '#ff9800'
      },
      {
        id: '2',
        title: '随机抽奖',
        description: '年会抽奖、班级点名、随机选择。',
        iconType: 'explore',
        color: '#9c27b0'
      },
      {
        id: '3',
        title: '二选一',
        description: '生存还是毁灭，这是个问题。',
        iconType: 'tune',
        color: '#3f51b5'
      },
      {
        id: '4',
        title: '周末去哪玩',
        description: '五棵松方圆10公里的公园应该去哪一个。',
        iconType: 'whatshot',
        color: '#03a9f4'
      },
      {
        id: '5',
        title: '宝宝吃什么',
        description: '基于精心收集的宝宝餐，根据当前时间，确定适合吃哪几种。',
        iconType: 'favorite',
        color: '#e91e63'
      }
    ];
  }

  /**
   * Get popular collections for the marketplace
   */
  static getPopularCollections(): Collection[] {
    return [
      {
        id: 'c1',
        title: '川菜食谱合集',
        description: '收集各种正宗川菜的食谱',
        count: 52,
        creatorName: '美食达人'
      },
      {
        id: 'c2',
        title: '健康轻食',
        description: '低卡、高蛋白、营养均衡的健康餐食',
        count: 28,
        creatorName: '营养师小王'
      },
      {
        id: 'c3',
        title: '甜点大全',
        description: '各种甜品和点心的做法',
        count: 36,
        creatorName: '甜点师傅'
      },
      {
        id: 'c4',
        title: '火锅食材',
        description: '火锅必备的各种食材推荐',
        count: 45,
        creatorName: '火锅控'
      },
      {
        id: 'c5',
        title: '家常菜谱',
        description: '简单易做的家常菜',
        count: 63,
        creatorName: '家庭厨师'
      },
      {
        id: 'c6',
        title: '早餐食谱',
        description: '营养美味的早餐选择',
        count: 31,
        creatorName: '早餐达人'
      }
    ];
  }

  /**
   * Get popular policies for the marketplace
   */
  static getPopularPolicies(): Policy[] {
    return [
      {
        id: 'p1',
        title: '随机单选',
        description: '完全随机选择一个选项',
        type: 'random',
        creatorName: '系统'
      },
      {
        id: 'p2',
        title: '多选排序',
        description: '多选并按特定顺序排列',
        type: 'sorting',
        creatorName: '系统'
      },
      {
        id: 'p3',
        title: '权重摇奖',
        description: '按照权重概率选择',
        type: 'weighted',
        creatorName: '系统'
      },
      {
        id: 'p4',
        title: '排除算法',
        description: '排除特定选项后随机选择',
        type: 'exclusion',
        creatorName: '抽奖达人'
      },
      {
        id: 'p5',
        title: '历史记忆',
        description: '记住历史选择，避免重复',
        type: 'custom',
        creatorName: '用户123'
      },
      {
        id: 'p6',
        title: '组合选择',
        description: '从多个集合中各选一个组合',
        type: 'custom',
        creatorName: '创意工作室'
      }
    ];
  }

  /**
   * Get popular applications in the community
   */
  static getPopularApplications(): PopularApplication[] {
    return [
      {
        id: 'a1',
        title: '北京美食地图',
        description: '覆盖北京各区域特色美食',
        creator: 'user1',
        likes: 458,
        category: '美食'
      },
      {
        id: 'a2',
        title: '减脂食谱精选',
        description: '专为减肥人群设计的低卡食谱',
        creator: 'user2',
        likes: 316,
        category: '健康'
      },
      {
        id: 'a3',
        title: '小孩健康餐',
        description: '适合3-6岁儿童的营养食谱',
        creator: 'user3',
        likes: 287,
        category: '亲子'
      },
      {
        id: 'a4',
        title: '节日抽奖大礼',
        description: '适合公司年会、节日庆典的抽奖方案',
        creator: 'user4',
        likes: 204,
        category: '活动'
      },
      {
        id: 'a5',
        title: '团建活动生成器',
        description: '快速生成团队建设活动方案',
        creator: 'user5',
        likes: 189,
        category: '工作'
      },
      {
        id: 'a6',
        title: '周末出游规划',
        description: '根据天气、距离推荐周末去处',
        creator: 'user6',
        likes: 175,
        category: '旅行'
      },
      {
        id: 'a7',
        title: '聚会游戏合集',
        description: '适合各种聚会场合的游戏规则',
        creator: 'user7',
        likes: 163,
        category: '娱乐'
      },
      {
        id: 'a8',
        title: '咖啡探店指南',
        description: '收集城市特色咖啡馆',
        creator: 'user8',
        likes: 142,
        category: '生活'
      }
    ];
  }

  /**
   * Search for items in the marketplace
   */
  static searchMarketplace(query: string): {
    scenarios: Scenario[];
    collections: Collection[];
    policies: Policy[];
    applications: PopularApplication[];
  } {
    const lowercaseQuery = query.toLowerCase();

    return {
      scenarios: ExploreApi.getRecommendedScenarios().filter(
        item =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          (item.description && item.description.toLowerCase().includes(lowercaseQuery))
      ),
      collections: ExploreApi.getPopularCollections().filter(
        item =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          (item.description && item.description.toLowerCase().includes(lowercaseQuery))
      ),
      policies: ExploreApi.getPopularPolicies().filter(
        item =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          (item.description && item.description.toLowerCase().includes(lowercaseQuery))
      ),
      applications: ExploreApi.getPopularApplications().filter(
        item =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          (item.description && item.description.toLowerCase().includes(lowercaseQuery))
      )
    };
  }
}
