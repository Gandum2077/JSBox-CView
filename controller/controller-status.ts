/**
 * status
 *   - created = 0 被创建，未被加载
 *   - loaded = 1 被加载，显示状态未知
 *   - appeared= 2 处于可显示状态
 *   - disappeared = 3 处于不显示状态
 *   - removed = 4 根视图被移除
 * 其中只有 2 和 3 可以相互转化，其他不可以
 */
export const controllerStatus = {
  created: 0,
  loaded: 1,
  appeared: 2,
  disappeared: 3,
  removed: 4,
} as const;
