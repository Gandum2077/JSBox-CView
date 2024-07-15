"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicContextMenuView = void 0;
const base_1 = require("./base");
const cvid_1 = require("../utils/cvid");
/**
 * 动态上下文菜单视图，此视图是为了弥补JSBox中无法动态调整上下文菜单的缺陷而设计的。
 *
 * 每次创建此视图，都会为其自动创建一个新的OC类（由于OC类注册是全局性的，数量过多会造成什么后果，尚不清楚）。
 * 用menuList列表来记录所需的动态上下文菜单，通过props.info.menuIndex来指定当前视图需要使用的菜单。
 *
 * 此视图除了一般UIView的props, layout, events, views四个参数外，还有两个必须的特殊参数：
 * 1. menuList: { title: string; items: MenuItem[] }[] 菜单列表，每个菜单项包含一个标题和一个MenuItem数组。
 * 2. props.info: { menuIndex: number } 用于指定当前视图的菜单索引，从0开始。info中可以包含其他参数。
 *
 */
class DynamicContextMenuView extends base_1.Base {
    constructor({ menuList, props, layout, events, views = [] }) {
        var _a, _b;
        super();
        if (!props.info || ((_a = props.info) === null || _a === void 0 ? void 0 : _a.menuIndex) === undefined || ((_b = props.info) === null || _b === void 0 ? void 0 : _b.menuIndex) === null) {
            throw new Error("props.info.menuIndex is required");
        }
        if (typeof props.info.menuIndex !== "number") {
            throw new Error("props.info.menuIndex must be a number");
        }
        if (props.info.menuIndex < 0 || props.info.menuIndex >= menuList.length) {
            throw new Error("props.info.menuIndex is out of range");
        }
        this._menuList = menuList;
        this._ocClassName = `DynamicContextMenuView_${cvid_1.cvid.newId}`;
        const runtimeView = this.createRuntimeView();
        this._defineView = () => {
            return {
                type: "runtime",
                props: Object.assign(Object.assign({}, props), { id: this.id, view: runtimeView }),
                layout,
                events,
                views
            };
        };
    }
    set menuIndex(index) {
        if (index < 0 || index >= this._menuList.length) {
            throw new Error("menuIndex is out of range");
        }
        // 必须重新赋值info，否则info不会改变
        this.view.info = Object.assign(Object.assign({}, this.view.info), { menuIndex: index });
    }
    get menuIndex() {
        return this.view.info.menuIndex;
    }
    defineOCClass() {
        $define({
            type: this._ocClassName + " : UIView <UIContextMenuInteractionDelegate>",
            events: {
                "contextMenuInteraction:configurationForMenuAtLocation:": (interacton, point) => {
                    var _a, _b;
                    const menuIndex = ((_b = (_a = interacton.$view().jsValue().info) === null || _a === void 0 ? void 0 : _a.menuIndex) !== null && _b !== void 0 ? _b : 0);
                    if (menuIndex < 0 || menuIndex >= this._menuList.length)
                        return;
                    return this.createContextMenuConfiguration(this._menuList[menuIndex]);
                }
            }
        });
    }
    createContextMenuConfiguration({ title, items }) {
        return $objc("UIContextMenuConfiguration").$configurationWithIdentifier_previewProvider_actionProvider(null, null, $block("UIMenu *, NSArray *", () => {
            const actions = items.map(item => {
                const action = $objc("UIAction").$actionWithTitle_image_identifier_handler(item.title, item.symbol, null, $block("void, UIAction *", () => item.handler()));
                if (item.destructive)
                    action.$setAttributes(1 << 1);
                return action;
            });
            return $objc("UIMenu").$menuWithTitle_children(title, actions);
        }));
    }
    createRuntimeView() {
        this.defineOCClass();
        const view = $objc(this._ocClassName).invoke("alloc.init");
        const interaction = $objc("UIContextMenuInteraction")
            .invoke("alloc")
            .invoke("initWithDelegate", view);
        view.$addInteraction(interaction);
        return view;
    }
}
exports.DynamicContextMenuView = DynamicContextMenuView;
