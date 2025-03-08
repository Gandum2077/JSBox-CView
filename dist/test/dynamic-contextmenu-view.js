"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynamic_contextmenu_view_1 = require("../components/dynamic-contextmenu-view");
let menuIndex = 0;
const menuList = [
    {
        title: "菜单1",
        items: [
            {
                title: "变成菜单1",
                symbol: "plus",
                handler: () => {
                    menuIndex = 0;
                },
            },
            {
                title: "变成菜单2",
                symbol: "plus",
                destructive: true,
                handler: () => {
                    menuIndex = 1;
                },
            },
        ],
    },
    {
        title: "菜单2",
        items: [
            {
                title: "变成菜单1",
                symbol: "plus",
                handler: () => {
                    menuIndex = 0;
                },
            },
            {
                title: "变成菜单2",
                symbol: "plus",
                handler: () => {
                    menuIndex = 1;
                },
            },
        ],
    },
];
const view = new dynamic_contextmenu_view_1.DynamicContextMenuView({
    generateContextMenu: (sender) => {
        return menuList[menuIndex];
    },
    props: {},
    layout: (make, view) => {
        make.center.equalTo(view.super);
        make.size.equalTo($size(100, 100));
    },
    views: [
        {
            type: "label",
            props: {
                text: "长按我",
                textColor: $color("black"),
                align: $align.center,
            },
            layout: $layout.center,
        },
    ],
});
$ui.render({
    views: [view.definition],
});
