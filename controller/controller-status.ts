/**
 * 控制器生命周期状态的数值常量。
 *
 * {@link BaseController} 的正常状态流转为 `created → loaded → appeared ⇄ disappeared → removed`。
 * `loaded` 也可以在首次显示前转为 `disappeared`，任意尚未移除的状态都可以通过 `remove()` 结束生命周期。
 * `removed` 表示控制器已触发最终清理并从 Router 注销，不表示其根 UIView 一定已从视图层级移除。
 */
export const controllerStatus = {
  /** 控制器已创建，但尚未加载。 */
  created: 0,
  /** 控制器已加载，当前可见性尚未确定。 */
  loaded: 1,
  /** 控制器当前处于可见状态。 */
  appeared: 2,
  /** 控制器已加载但当前不可见。 */
  disappeared: 3,
  /** 控制器生命周期已结束并已从 Router 注销。 */
  removed: 4,
} as const;
