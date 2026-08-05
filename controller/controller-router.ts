import { BaseController } from "./base-controller";
import { controllerStatus } from "./controller-status";

/**
 * 记录 CView 控制器实例及当前根控制器的轻量注册表。
 *
 * Router 不维护导航栈，也不会主动推进控制器生命周期。通常由 {@link BaseController.load} 登记实例、
 * {@link BaseController.remove} 注销实例，并由 {@link BaseController.uirender} 设置 {@link root}；应用代码主要通过
 * {@link get}、{@link appeared} 和 {@link controllerSet} 查询当前控制器。
 *
 * 注册集合按对象身份去重，不校验控制器 ID。默认 ID 由框架保证唯一；如果调用方手动指定重复 ID，{@link get}
 * 只会返回迭代时遇到的第一个匹配项。删除控制器不会自动清除 {@link root}，因此 `root` 表示最近通过 `uirender`
 * 指定的根控制器，而不保证该实例仍在注册集合中。
 *
 * {@link controllerSet} 暴露的是底层可变 `Set`，外部应将其视为只读集合；直接修改会绕过控制器生命周期事件。
 * @example
 * ```ts
 * const controller = router.get(controllerId)
 * const visibleControllers = router.appeared
 * ```
 */
class Router {
  /** 当前已登记的控制器实例集合。 */
  private _set: Set<BaseController>;

  /** 最近通过 `uirender` 指定的根控制器。 */
  root?: BaseController;

  /** 创建空的控制器注册表。 */
  constructor() {
    this._set = new Set();
  }

  /**
   * 按对象身份登记控制器。
   *
   * 重复登记同一实例不会产生额外条目，也不会改变其生命周期状态。
   * @param controller - 要登记的控制器。
   */
  add(controller: BaseController) {
    this._set.add(controller);
  }

  /**
   * 从注册集合中删除指定控制器实例。
   *
   * 此操作不会触发控制器生命周期、移除视图或清除 {@link root}。
   * @param controller - 要删除的控制器。
   */
  delete(controller: BaseController) {
    this._set.delete(controller);
  }

  /**
   * 按 ID 查找已登记的控制器。
   * @param id - 控制器 ID。
   * @returns 第一个匹配的控制器；未找到时返回 `undefined`。
   */
  get(id: string) {
    for (const c of this._set) {
      if (c.id === id) return c;
    }
    return;
  }

  /**
   * 获取当前处于 `appeared` 状态的已登记控制器。
   * @returns 每次访问时新建的控制器数组。
   */
  get appeared() {
    const appearedControllers = [];
    for (const c of this._set) {
      if (c.status === controllerStatus.appeared) appearedControllers.push(c);
    }
    return appearedControllers;
  }

  /**
   * 获取底层控制器注册集合。
   *
   * 返回值不是副本；调用方应将其视为只读集合，避免绕过生命周期直接修改。
   * @returns 当前使用的控制器 `Set`。
   */
  get controllerSet() {
    return this._set;
  }
}

/** 全局控制器注册表。 */
export const router = new Router();
