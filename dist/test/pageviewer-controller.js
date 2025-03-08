"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pageviewer_controller_1 = require("../controller/pageviewer-controller");
const base_controller_1 = require("../controller/base-controller");
const items = [
    {
        controller: new base_controller_1.BaseController({ props: { bgcolor: $color("red") } }),
        title: "Page 1",
    },
    {
        controller: new base_controller_1.BaseController({ props: { bgcolor: $color("yellow") } }),
        title: "Page 2",
    },
];
const pageViewerController = new pageviewer_controller_1.PageViewerController({
    props: {
        items,
    },
});
pageViewerController.uirender({});
