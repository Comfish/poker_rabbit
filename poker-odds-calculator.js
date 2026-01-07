/**
 * 德州扑克胜率计算核心逻辑（蒙特卡洛模拟）
 * 输入：我的手牌、已知公共牌、对手人数
 * 输出：胜率、平局概率、输的概率
 */

// 牌型等级定义（从低到高）
const HAND_RANKS = {
  HIGH_CARD: 0,         // 高牌
  ONE_PAIR: 1,          // 一对
  TWO_PAIR: 2,          // 两对
  THREE_OF_A_KIND: 3,   // 三条
  STRAIGHT: 4,          // 顺子
  FLUSH: 5,             // 同花
  FULL_HOUSE: 6,        // 葫芦
  FOUR_OF_A_KIND: 7,    // 四条
  STRAIGHT_FLUSH: 8,    // 同花顺
  ROYAL_FLUSH: 9        // 皇家同花顺
};

// 花色映射
const SUIT_MAP = {
  's': 0,  // 黑桃
  'h': 1,  // 红桃
  'd': 2,  // 方块
  'c': 3   // 梅花
};

// 点数映射
const RANK_MAP = {
  '2': 0,
  '3': 1,
  '4': 2,
  '5': 3,
  '6': 4,
  '7': 5,
  '8': 6,
  '9': 7,
  'T': 8,  // 10
  'J': 9,  // J
  'Q': 10, // Q
  'K': 11, // K
  'A': 12  // A
};

/**
 * 将卡牌字符串转换为数字编码
 * 例如：As -> 0, Kd -> 39
 * 编码规则：0-12=黑桃2-A, 13-25=红桃2-A, 26-38=梅花2-A, 39-51=方块2-A
 * @param {string} cardStr - 卡牌字符串，如"As"（黑桃A）、"Kd"（方块K）
 * @returns {number} - 卡牌的数字编码
 */
function parseCard(cardStr) {
  // 解析花色和点数
  const rankStr = cardStr[0];  // 点数：A, K, Q, J, T, 9-2
  const suitStr = cardStr[1];  // 花色：s, h, d, c
  
  // 转换为数字编码
  const rank = RANK_MAP[rankStr];
  const suit = SUIT_MAP[suitStr];
  
  return suit * 13 + rank;
}

/**
 * 解析多张卡牌
 * @param {Array<string>} cardStrs - 卡牌字符串数组，如["As", "Kd"]
 * @returns {Array<number>} - 卡牌数字编码数组
 */
function parseCards(cardStrs) {
  return cardStrs.map(parseCard);
}

/**
 * Fisher-Yates 洗牌算法
 * @param {Array} array - 要洗牌的数组
 * @returns {Array} - 洗牌后的数组
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * 从卡牌编码中提取点数
 * @param {number} card - 卡牌编码
 * @returns {number} - 点数（0-12，对应2-A）
 */
function getRank(card) {
  return card % 13;
}

/**
 * 从卡牌编码中提取花色
 * @param {number} card - 卡牌编码
 * @returns {number} - 花色（0-3，对应黑桃、红桃、方块、梅花）
 */
function getSuit(card) {
  return Math.floor(card / 13);
}

/**
 * 统计卡牌点数出现次数
 * @param {Array<number>} cards - 卡牌编码数组
 * @returns {Map<number, number>} - 点数到出现次数的映射
 */
function countRanks(cards) {
  const rankCounts = new Map();
  for (const card of cards) {
    const rank = getRank(card);
    rankCounts.set(rank, (rankCounts.get(rank) || 0) + 1);
  }
  return rankCounts;
}

/**
 * 统计卡牌花色出现次数
 * @param {Array<number>} cards - 卡牌编码数组
 * @returns {Map<number, number>} - 花色到出现次数的映射
 */
function countSuits(cards) {
  const suitCounts = new Map();
  for (const card of cards) {
    const suit = getSuit(card);
    suitCounts.set(suit, (suitCounts.get(suit) || 0) + 1);
  }
  return suitCounts;
}

/**
 * 检查是否为顺子
 * @param {Array<number>} ranks - 点数数组
 * @returns {boolean} - 是否为顺子
 */
function isStraight(ranks) {
  // 去重并排序
  const uniqueRanks = Array.from(new Set(ranks)).sort((a, b) => a - b);
  
  // 特殊情况：A-2-3-4-5（最小的顺子）
  if (uniqueRanks.includes(12) && // A
      uniqueRanks.includes(0) &&   // 2
      uniqueRanks.includes(1) &&   // 3
      uniqueRanks.includes(2) &&   // 4
      uniqueRanks.includes(3)) {   // 5
    return true;
  }
  
  // 常规顺子检查：连续5个数字
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    let isConsecutive = true;
    for (let j = 1; j < 5; j++) {
      if (uniqueRanks[i + j] !== uniqueRanks[i] + j) {
        isConsecutive = false;
        break;
      }
    }
    if (isConsecutive) {
      return true;
    }
  }
  
  return false;
}

/**
 * 检查是否为同花
 * @param {Array<number>} cards - 卡牌编码数组
 * @returns {boolean} - 是否为同花
 */
function isFlush(cards) {
  const suitCounts = countSuits(cards);
  // 检查是否有花色出现5次或以上
  return Array.from(suitCounts.values()).some(count => count >= 5);
}

/**
 * 评估手牌，返回牌型等级和关键牌信息
 * @param {Array<number>} cards - 7张卡牌（2张手牌+5张公共牌）
 * @returns {Object} - 牌型评估结果
 */
function evaluateHand(cards) {
  // 提取所有点数和花色
  const ranks = cards.map(getRank);
  const suits = cards.map(getSuit);
  
  // 统计点数和花色出现次数
  const rankCounts = countRanks(cards);
  const suitCounts = countSuits(cards);
  
  // 检查基本牌型条件
  const flush = isFlush(cards);
  const straight = isStraight(ranks);
  
  // 按出现次数降序排序（用于判断牌型）
  const sortedCounts = Array.from(rankCounts.values()).sort((a, b) => b - a);
  
  let handRank = HAND_RANKS.HIGH_CARD;
  
  // 判断具体牌型
  if (flush && straight) {
    // 同花顺或皇家同花顺
    // 检查是否为皇家同花顺（10-J-Q-K-A）
    const hasTen = ranks.includes(8);  // T
    const hasJack = ranks.includes(9); // J
    const hasQueen = ranks.includes(10); // Q
    const hasKing = ranks.includes(11); // K
    const hasAce = ranks.includes(12); // A
    
    if (hasTen && hasJack && hasQueen && hasKing && hasAce) {
      handRank = HAND_RANKS.ROYAL_FLUSH;
    } else {
      handRank = HAND_RANKS.STRAIGHT_FLUSH;
    }
  } else if (sortedCounts[0] === 4) {
    // 四条
    handRank = HAND_RANKS.FOUR_OF_A_KIND;
  } else if (sortedCounts[0] === 3 && sortedCounts[1] === 2) {
    // 葫芦
    handRank = HAND_RANKS.FULL_HOUSE;
  } else if (flush) {
    // 同花
    handRank = HAND_RANKS.FLUSH;
  } else if (straight) {
    // 顺子
    handRank = HAND_RANKS.STRAIGHT;
  } else if (sortedCounts[0] === 3) {
    // 三条
    handRank = HAND_RANKS.THREE_OF_A_KIND;
  } else if (sortedCounts[0] === 2 && sortedCounts[1] === 2) {
    // 两对
    handRank = HAND_RANKS.TWO_PAIR;
  } else if (sortedCounts[0] === 2) {
    // 一对
    handRank = HAND_RANKS.ONE_PAIR;
  }
  
  // 获取关键牌（用于相同牌型比较）
  // 将点数按出现次数降序，出现次数相同则按点数降序
  const keyRanks = Array.from(rankCounts.entries())
    .sort((a, b) => {
      // 先按出现次数降序
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      // 出现次数相同，按点数降序
      return b[0] - a[0];
    })
    .map(entry => entry[0]);
  
  return {
    rank: handRank,       // 牌型等级
    keyRanks: keyRanks    // 关键牌（用于比较大小）
  };
}

/**
 * 比较两手牌的大小
 * @param {Object} hand1 - 第一手牌的评估结果
 * @param {Object} hand2 - 第二手牌的评估结果
 * @returns {number} - 1: hand1赢, -1: hand2赢, 0: 平局
 */
function compareHands(hand1, hand2) {
  // 先比较牌型等级
  if (hand1.rank > hand2.rank) {
    return 1;
  } else if (hand1.rank < hand2.rank) {
    return -1;
  }
  
  // 牌型相同，比较关键牌
  for (let i = 0; i < hand1.keyRanks.length; i++) {
    if (hand1.keyRanks[i] > hand2.keyRanks[i]) {
      return 1;
    } else if (hand1.keyRanks[i] < hand2.keyRanks[i]) {
      return -1;
    }
  }
  
  // 完全相同
  return 0;
}

/**
 * 计算德州扑克胜率（蒙特卡洛模拟）
 * @param {Array<string>} myCards - 我的两张手牌，如["As", "Kd"]
 * @param {Array<string>} communityCards - 已知公共牌，如["Ah", "Kh", "Qh"]
 * @param {number} opponentCount - 对手人数（1-8）
 * @param {number} simulations - 模拟次数（默认5000次）
 * @returns {Object} - 胜率结果：{win: 胜率, tie: 平局概率, lose: 输的概率, simulations: 模拟次数}
 */
export function calculatePokerOdds(myCards, communityCards, opponentCount, simulations = 5000) {
  // 1. 解析卡牌为数字编码
  const myCardsEncoded = parseCards(myCards);
  const communityCardsEncoded = parseCards(communityCards);
  
  // 2. 验证输入
  if (myCardsEncoded.length !== 2) {
    throw new Error("我的手牌必须是2张");
  }
  if (communityCardsEncoded.length < 0 || communityCardsEncoded.length > 5) {
    throw new Error("公共牌数量必须在0-5之间");
  }
  if (opponentCount < 1 || opponentCount > 8) {
    throw new Error("对手人数必须在1-8之间");
  }
  
  // 3. 创建完整牌组并移除已知牌
  const fullDeck = Array.from({ length: 52 }, (_, i) => i);
  const knownCards = [...myCardsEncoded, ...communityCardsEncoded];
  const remainingDeck = fullDeck.filter(card => !knownCards.includes(card));
  
  // 4. 统计变量
  let wins = 0;
  let ties = 0;
  
  // 5. 蒙特卡洛模拟主循环
  for (let i = 0; i < simulations; i++) {
    // 洗牌
    const shuffledDeck = shuffleArray(remainingDeck);
    
    // 分配对手手牌（每个对手2张）
    const opponentsCards = [];
    let cardIndex = 0;
    for (let j = 0; j < opponentCount; j++) {
      opponentsCards.push([
        shuffledDeck[cardIndex++],
        shuffledDeck[cardIndex++]
      ]);
    }
    
    // 生成剩余公共牌
    const remainingCommunityCardsNeeded = 5 - communityCardsEncoded.length;
    const simulatedCommunityCards = shuffledDeck.slice(
      cardIndex,
      cardIndex + remainingCommunityCardsNeeded
    );
    const finalCommunityCards = [...communityCardsEncoded, ...simulatedCommunityCards];
    
    // 计算我的最终牌型
    const myFinalHand = [...myCardsEncoded, ...finalCommunityCards];
    const myBestHand = evaluateHand(myFinalHand);
    
    let isWinner = true;
    let hasTie = false;
    
    // 比较所有对手的牌型
    for (const opponentHoleCards of opponentsCards) {
      const opponentFinalHand = [...opponentHoleCards, ...finalCommunityCards];
      const opponentBestHand = evaluateHand(opponentFinalHand);
      
      const comparison = compareHands(myBestHand, opponentBestHand);
      if (comparison < 0) {
        // 对手赢，我输
        isWinner = false;
        break;
      } else if (comparison === 0) {
        // 平局
        hasTie = true;
      }
    }
    
    // 更新统计
    if (isWinner) {
      if (hasTie) {
        ties++;
      } else {
        wins++;
      }
    }
  }
  
  // 6. 计算概率
  const winPercentage = (wins / simulations) * 100;
  const tiePercentage = (ties / simulations) * 100;
  const losePercentage = 100 - winPercentage - tiePercentage;
  
  // 7. 返回结果
  return {
    win: parseFloat(winPercentage.toFixed(2)),    // 胜率，保留2位小数
    tie: parseFloat(tiePercentage.toFixed(2)),    // 平局概率，保留2位小数
    lose: parseFloat(losePercentage.toFixed(2)),  // 输的概率，保留2位小数
    simulations                                   // 模拟次数
  };
}
