/**
 * # Base<T extends AllUIView, R extends UiTypes.AllViewOptions>
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

import { cvid } from '../utils/cvid';

export abstract class Base<T extends AllUIView, R extends UiTypes.AllViewOptions> {
  readonly id: string;
  private _view?: T;
  abstract _defineView: () => R;
  _layout?: (make: MASConstraintMaker, view: T) => void;
  
  constructor() {
    this.id = cvid.newId;
  }

  get definition() {
    return this._defineView();
  }

  get view() {
    if (!this._view) this._view = $(this.id) as T;
    return this._view;
  }

  add(view: UiTypes.AllViewOptions | Base<any, any>) {
    if (view instanceof Base) {
      this.view.add(view.definition);
    } else {
      this.view.add(view);
    }
  }
}
