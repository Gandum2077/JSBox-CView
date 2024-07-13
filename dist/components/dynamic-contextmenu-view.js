"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicContextMenuView = void 0;
const base_1 = require("./base");
const RegisteredOCClassName = new Set();
function defineOCClass({ classname, menuList }) {
    if (RegisteredOCClassName.has(classname))
        return;
    RegisteredOCClassName.add(classname);
    $define({
        type: classname + " : UIView <UIContextMenuInteractionDelegate>",
        events: {
            "contextMenuInteraction:configurationForMenuAtLocation:": (interacton, point) => {
                var _a, _b;
                console.log(interacton.$view().jsValue().info);
                const menuIndex = ((_b = (_a = interacton.$view().jsValue().info) === null || _a === void 0 ? void 0 : _a.menuIndex) !== null && _b !== void 0 ? _b : 0);
                if (menuIndex < 0 || menuIndex >= menuList.length)
                    return;
                return createContextMenuConfiguration(menuList[menuIndex]);
            }
        }
    });
}
function createUIAction(item) {
    const action = $objc("UIAction").$actionWithTitle_image_identifier_handler(item.title, item.symbol, null, $block("void, UIAction *", () => item.handler()));
    if (item.destructive)
        action.$setAttributes(1 << 1);
    return action;
}
;
function createContextMenuConfiguration({ title, items }) {
    return $objc("UIContextMenuConfiguration").$configurationWithIdentifier_previewProvider_actionProvider(null, null, $block("UIMenu *, NSArray *", () => {
        const actions = items.map(item => createUIAction(item));
        return $objc("UIMenu").$menuWithTitle_children(title, actions);
    }));
}
function createRuntimeView(classname, menuList) {
    defineOCClass({ classname, menuList });
    const view = $objc(classname).invoke("alloc.init");
    const interaction = $objc("UIContextMenuInteraction")
        .invoke("alloc")
        .invoke("initWithDelegate", view);
    view.$addInteraction(interaction);
    return view;
}
/**
 * 动态上下文菜单视图，此视图是为了弥补JSBox中无法动态调整上下文菜单的缺陷而设计的。
 *
 * 由于OC类的注册是全局性的，所以需要特殊的处理来避免重复注册类：对于使用同一套动态上下文菜单的View，应该注册为同一个类。
 * 用menuList列表来记录所需的动态上下文菜单，通过props.info.menuIndex来指定当前视图需要使用的菜单。
 *
 * 此视图除了一般UIView的props, layout, events, views四个参数外，还有三个必须的特殊参数：
 * 1. ocClassName: string OC类名，用于注册OC类，一个类名只能注册一次，重复注册会被忽略。
 *    这和menuList是配套的，同一套menuList用同一个类名。
 * 2. menuList: { title: string; items: MenuItem[] }[] 菜单列表，每个菜单项包含一个标题和一个MenuItem数组。
 * 3. props.info: { menuIndex: number } 用于指定当前视图的菜单索引，从0开始。info中可以包含其他参数。
 *
 */
class DynamicContextMenuView extends base_1.Base {
    constructor({ ocClassName, menuList, props, layout, events, views = [] }) {
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
        const runtimeView = createRuntimeView(ocClassName, menuList);
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
}
exports.DynamicContextMenuView = DynamicContextMenuView;
