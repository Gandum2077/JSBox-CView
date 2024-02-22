"use strict";
/**
 * 控制器的路由器，用于管理控制器的集合和操作。
 *
 * ## 属性
 * - `root`：根控制器。
 * - `appeared`：状态为appeared的控制器列表。
 * - `controllerSet`：控制器集合。
 *
 * ## 方法
 * - `add(controller: BaseController)`：添加控制器到路由器中。
 * - `delete(controller: BaseController)`：从路由器中删除控制器。
 * - `get(id: string)`：根据控制器的ID获取控制器。
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
class Router {
    constructor() {
        this._set = new Set();
    }
    /**
     * 添加控制器到路由器中。
     * @param controller 要添加的控制器。
     */
    add(controller) {
        this._set.add(controller);
    }
    /**
     * 从路由器中删除控制器。
     * @param controller 要删除的控制器。
     */
    delete(controller) {
        this._set.delete(controller);
    }
    /**
     * 根据控制器的ID获取控制器。
     * @param id 控制器的ID。
     * @returns 匹配的控制器，如果找不到则返回undefined。
     */
    get(id) {
        for (const c of this._set) {
            if (c.id === id)
                return c;
        }
        return;
    }
    /**
     * 获取状态为appeared的控制器集合。
     * @returns 控制器集合。
     */
    get appeared() {
        const appearedControllers = [];
        for (const c of this._set) {
            if (c.status === 2)
                appearedControllers.push(c);
        }
        return appearedControllers;
    }
    /**
     * 获取控制器集合。
     * @returns 控制器集合。
     */
    get controllerSet() {
        return this._set;
    }
}
exports.router = new Router();
