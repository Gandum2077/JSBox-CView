"use strict";
// 自定义的语义化颜色
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionHeaderColor = exports.gold = exports.searchBarBgcolor = exports.searchBarSymbolColor = exports.footBarDefaultSegmentColor = exports.sheetNavBarColor = void 0;
exports.sheetNavBarColor = $color("tint", $color("tertiarySurface"));
exports.footBarDefaultSegmentColor = $color("#b7bec6", "#6e6e6e");
//fixedSecondarySurface: $color("#f2f2f7", $color("secondarySurface")), // 让 secondarySurface 在light mode下可以和纯白区分
exports.searchBarSymbolColor = $color("#777", "#aaa");
exports.searchBarBgcolor = $color("backgroundColor", "secondarySurface");
exports.gold = $color("#ffd700");
exports.sectionHeaderColor = $color({
    light: "#666666",
    dark: "#acacac",
    black: "#ababab"
});
