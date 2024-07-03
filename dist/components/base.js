"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base = void 0;
const cvid_1 = require("../utils/cvid");
/**
 *
 * 组件 Base 基类，用于创建自定义组件。CView 的所有子类都应该继承自 Base。
 *
 * ## 属性
 * - id: string  组件的唯一 id
 * - view: T  通过自动创建的唯一 id 进行查找，获得对应的 UIView 对象
 * - definition: R  获得对应的 view 的定义
 *
 * ## 方法
 * - add(view: UiTypes.AllViewOptions | Base<any, any>): void  添加子 view。其中 `view` 参数可以是 CView，或 view 的定义
 *
 * ## 说明
 * 视图是 CView 框架的重点，其名称的含义为“组件化视图”。设计目的是：
 * - 通过组件化的方式，将JSBox view的定义和实例绑定，使用起来更加方便
 * - 可以便利地创建自定义组件
 */
class Base {
    constructor() {
        this.id = cvid_1.cvid.newId;
    }
    get definition() {
        return this._defineView();
    }
    get view() {
        if (!this._view)
            this._view = $(this.id);
        return this._view;
    }
    add(view) {
        if (view instanceof Base) {
            this.view.add(view.definition);
        }
        else {
            this.view.add(view);
        }
    }
}
exports.Base = Base;
