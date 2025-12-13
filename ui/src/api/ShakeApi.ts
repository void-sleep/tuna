// 结果显示用的石头剪刀布表情
export const resultEmojis = ['✊', '✋', '✌'];

/**
 * 获取随机表情
 * @returns 随机选择的表情
 */
export const createRandomEmoji = (): string => {
  return resultEmojis[Math.floor(Math.random() * resultEmojis.length)];
};
