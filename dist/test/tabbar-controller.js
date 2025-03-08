"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabbar_controller_1 = require("../controller/tabbar-controller");
const base_controller_1 = require("../controller/base-controller");
const items = [
    {
        controller: new base_controller_1.BaseController({
            props: { bgcolor: $color("red") },
            events: {
                didAppear: () => {
                    console.log("Page 1 did appear");
                },
                didDisappear: () => {
                    console.log("Page 1 did disappear");
                },
            },
        }),
        title: "Page 1",
    },
    {
        controller: new base_controller_1.BaseController({
            props: { bgcolor: $color("yellow") },
            events: {
                didAppear: () => {
                    console.log("Page 2 did appear");
                },
                didDisappear: () => {
                    console.log("Page 2 did disappear");
                },
            },
        }),
        title: "Page 2",
    },
];
const pageViewerController = new tabbar_controller_1.TabBarController({
    props: {
        items,
    },
    events: {
        changed: (sender, index) => {
            console.log(`Index changed to ${index}`);
        },
        doubleTapped: (sender, index) => {
            console.log(`Double tapped on index ${index}`);
        },
    },
});
pageViewerController.uirender({});
