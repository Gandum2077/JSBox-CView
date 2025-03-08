"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flowlayout_1 = require("../components/flowlayout");
const single_views_1 = require("../components/single-views");
class FlowlayoutItem extends single_views_1.Label {
    constructor(text) {
        super({
            props: {
                text: text,
                borderWidth: 1,
            },
            layout: $layout.fill,
        });
        this._text = text;
    }
    itemWidth() {
        return this._text.length * 10;
    }
}
const flowlayout = new flowlayout_1.Flowlayout({
    props: {
        items: [
            new FlowlayoutItem("Hello"),
            new FlowlayoutItem("World"),
            new FlowlayoutItem("Flowlayout"),
        ],
        spacing: 10,
        itemHeight: 30,
        fixedRows: 2,
        fixedHeight: true,
        menu: {
            items: [
                {
                    symbol: "plus",
                    handler: (sender) => console.log("here"),
                },
            ],
        },
    },
    layout: (make, view) => {
        make.left.right.inset(10);
        make.top.inset(100);
        make.height.equalTo(70);
    },
    events: {
        didSelect: (sender, index, item) => {
            $ui.alert(item.view.text);
        },
    },
});
$ui.render({
    props: {
        navButtons: [
            {
                symbol: "plus",
                handler: () => {
                    flowlayout.items = [
                        new FlowlayoutItem("Hello"),
                        new FlowlayoutItem("World"),
                        new FlowlayoutItem("Flowlayout"),
                        new FlowlayoutItem("New Item"),
                        new FlowlayoutItem("Hello"),
                        new FlowlayoutItem("World"),
                        new FlowlayoutItem("FlowlayoutFlowlayoutFlowlayout"),
                        new FlowlayoutItem("New Item"),
                        new FlowlayoutItem("Hello"),
                        new FlowlayoutItem("World"),
                        new FlowlayoutItem("FlowlayoutFlowlayoutFlowlayoutFlowlayoutFlowlayoutFlowlayout"),
                        new FlowlayoutItem("New Item"),
                        new FlowlayoutItem("Hello"),
                        new FlowlayoutItem("World"),
                        new FlowlayoutItem("FlowlayoutFlowlayoutFlowlayoutFlowlayoutFlowlayoutFlowlayoutFlowlayoutFlowlayout"),
                        new FlowlayoutItem("New Item"),
                    ];
                },
            },
        ],
    },
    views: [flowlayout.definition],
});
