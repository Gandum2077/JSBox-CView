"use strict";
// 用于UI相关的工具函数
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLayer = exports.layerCommonOptions = exports.absoluteFrame = exports.getTextHeight = exports.getTextWidth = exports.getWindowSize = void 0;
/**
 * 立即获得window size
 */
function getWindowSize() {
    const window = $objc("UIWindow").$keyWindow().jsValue();
    return window.size;
}
exports.getWindowSize = getWindowSize;
/**
 * 获取单行字符串应有的宽度
 * 默认额外添加3 inset
 */
function getTextWidth(text, { font = $font(17), inset = 3 } = {}) {
    return (Math.ceil($text.sizeThatFits({
        text,
        width: 10000,
        font,
        lineSpacing: 0,
    }).width) + inset);
}
exports.getTextWidth = getTextWidth;
/**
 * 获取字符串指定宽度后应有的高度
 * 默认额外添加3 inset
 */
function getTextHeight(text, { width = 300, font = $font(17), inset = 3, lineSpacing = 0 } = {}) {
    return (Math.ceil($text.sizeThatFits({
        text,
        width,
        font,
        lineSpacing,
    }).height) + inset);
}
exports.getTextHeight = getTextHeight;
/**
 * 计算某个view在某个上级view（若不指定则为UIWindow）上的绝对frame
 * 此方法不考虑旋转变形等特殊情况
 */
function absoluteFrame(view, endView) {
    const frame = view.frame;
    let superView = view.super;
    while (superView) {
        frame.x += superView.frame.x - superView.bounds.x;
        frame.y += superView.frame.y - superView.bounds.y;
        if (endView && superView === endView)
            break;
        superView = superView.super;
    }
    return frame;
}
exports.absoluteFrame = absoluteFrame;
exports.layerCommonOptions = {
    none: {
        cornerRadius: 0,
        shadowRadius: 0,
        shadowOpacity: 0,
        shadowOffset: $size(0, 0),
        shadowColor: $color("clear"),
    },
    roundedShadow: {
        cornerRadius: 12,
        shadowRadius: 10,
        shadowOpacity: 1,
        shadowOffset: $size(0, 0),
        shadowColor: $color("black"),
    },
    textShadow: {
        cornerRadius: 0,
        shadowRadius: 1.2,
        shadowOpacity: 1,
        shadowOffset: $size(0, 1),
        shadowColor: $color("black"),
    },
    circleViewShadow: {
        cornerRadius: 25,
        shadowRadius: 3,
        shadowOpacity: 0.6,
        shadowOffset: $size(0, 3),
        shadowColor: $color("black"),
    },
    toastShadows: {
        cornerRadius: 15,
        shadowRadius: 8,
        shadowOpacity: 0.35,
        shadowOffset: $size(0, 0),
        shadowColor: $color("black"),
    },
};
/**
 * 在layout中使用
 * 所应用的view不可以指定radius和clipTobounds，否则无效
 */
function setLayer(view, { cornerRadius = 0, shadowRadius = 0, shadowOpacity = 0, shadowOffset = $size(0, 0), shadowColor = $color("clear"), } = {}) {
    const layer = view.ocValue().invoke("layer");
    layer.invoke("setCornerRadius", cornerRadius);
    layer.invoke("setShadowRadius", shadowRadius);
    layer.invoke("setShadowOpacity", shadowOpacity);
    layer.invoke("setShadowOffset", shadowOffset);
    layer.invoke("setShadowColor", shadowColor.ocValue().invoke("CGColor"));
}
exports.setLayer = setLayer;
