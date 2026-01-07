/**
 * 德州扑克胜率计算测试脚本
 * 用于验证核心计算逻辑是否正常工作
 */

// 引入胜率计算函数
import { calculatePokerOdds } from './poker-odds-calculator.js';

/**
 * 测试函数
 * @param {string} testName - 测试名称
 * @param {Array} myCards - 我的手牌
 * @param {Array} communityCards - 公共牌
 * @param {number} opponentCount - 对手人数
 */
function runTest(testName, myCards, communityCards, opponentCount) {
  console.log(`\n=== ${testName} ===`);
  console.log(`我的手牌: ${myCards}`);
  console.log(`公共牌: ${communityCards}`);
  console.log(`对手人数: ${opponentCount}`);
  
  try {
    const startTime = performance.now();
    const result = calculatePokerOdds(myCards, communityCards, opponentCount);
    const endTime = performance.now();
    
    console.log(`计算结果:`);
    console.log(`- 胜率: ${result.win}%`);
    console.log(`- 平局概率: ${result.tie}%`);
    console.log(`- 输的概率: ${result.lose}%`);
    console.log(`- 模拟次数: ${result.simulations}`);
    console.log(`- 计算时间: ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    console.error(`测试失败: ${error.message}`);
    return null;
  }
}

// 运行测试用例
console.log("德州扑克胜率计算测试");
console.log("===================");

// 测试用例1：AK vs 1个对手，无公共牌
runTest(
  "测试用例1: AK vs 1个对手，无公共牌",
  ["As", "Kd"],
  [],
  1
);

// 测试用例2：AA vs 2个对手，翻牌有A
runTest(
  "测试用例2: AA vs 2个对手，翻牌有A",
  ["As", "Ah"],
  ["Ac", "2d", "3s"],
  2
);

// 测试用例3：同花听牌 vs 3个对手，翻牌有两张同花
runTest(
  "测试用例3: 同花听牌 vs 3个对手，翻牌有两张同花",
  ["Ah", "Kh"],
  ["Qh", "Jh", "2d"],
  3
);

// 测试用例4：四条 vs 4个对手，河牌
runTest(
  "测试用例4: 四条 vs 4个对手，河牌",
  ["As", "Ad"],
  ["Ac", "Ah", "Kd"],
  4
);

console.log("\n=== 所有测试完成 ===");
