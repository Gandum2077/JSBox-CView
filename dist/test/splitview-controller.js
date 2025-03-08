"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const splitview_controller_1 = require("../controller/splitview-controller");
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
        bgcolor: $color("red"),
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
        bgcolor: $color("green"),
    },
];
const pageViewerController = new splitview_controller_1.SplitViewController({
    props: {
        items,
    },
    events: {},
});
pageViewerController.uirender();
