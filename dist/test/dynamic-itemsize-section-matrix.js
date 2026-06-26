"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynamic_itemsize_section_matrix_1 = require("../components/dynamic-itemsize-section-matrix");
const makeItem = (sectionName, index) => {
    return {
        symbol: { symbol: index % 2 === 0 ? "sparkles" : "square.grid.2x2" },
        title: { text: `${sectionName} ${index}` },
        subtitle: { text: `Item index ${index}` },
        badge: { text: `${index}` },
    };
};
const sections = [
    {
        title: "Pinned",
        items: [makeItem("Pinned", 1), makeItem("Pinned", 2), makeItem("Pinned", 3)],
    },
    {
        title: "Long Section Title To Verify The Custom Title Cell Uses Dynamic Height\nLine 2\nLine 3",
        items: [makeItem("Recent", 1), makeItem("Recent", 2), makeItem("Recent", 3), makeItem("Recent", 4)],
    },
    {
        title: "",
        items: [makeItem("Untitled", 1), makeItem("Untitled", 2)],
    },
];
const matrix = new dynamic_itemsize_section_matrix_1.DynamicItemSizeSectionMatrix({
    props: {
        spacing: 8,
        minItemWidth: $device.isIpad ? 180 : 142,
        maxColumns: $device.isIpad ? 4 : 2,
        data: sections,
        template: {
            views: [
                {
                    type: "view",
                    props: {
                        bgcolor: $color("yellow"),
                        cornerRadius: 8,
                    },
                    layout: $layout.fill,
                    views: [
                        {
                            type: "image",
                            props: {
                                id: "symbol",
                                contentMode: $contentMode.scaleAspectFit,
                                tintColor: $color("tint"),
                            },
                            layout: (make, view) => {
                                make.left.top.inset(12);
                                make.size.equalTo($size(32, 32));
                            },
                        },
                        {
                            type: "label",
                            props: {
                                id: "badge",
                                align: $align.center,
                                font: $font(12),
                                textColor: $color("white"),
                                bgcolor: $color("tint"),
                                cornerRadius: 10,
                            },
                            layout: (make, view) => {
                                make.top.right.inset(12);
                                make.size.equalTo($size(28, 20));
                            },
                        },
                        {
                            type: "label",
                            props: {
                                id: "title",
                                font: $font("bold", 15),
                                textColor: $color("primaryText"),
                            },
                            layout: (make, view) => {
                                make.left.right.inset(12);
                                make.top.equalTo(view.prev.prev.bottom).offset(10);
                                make.height.equalTo(20);
                            },
                        },
                        {
                            type: "label",
                            props: {
                                id: "subtitle",
                                font: $font(12),
                                textColor: $color("secondaryText"),
                            },
                            layout: (make, view) => {
                                make.left.right.inset(12);
                                make.top.equalTo(view.prev.bottom).offset(4);
                                make.bottom.inset(12);
                            },
                        },
                    ],
                },
            ],
        },
    },
    layout: $layout.fill,
    events: {
        itemHeight: (width) => Math.max(112, width * 0.72),
        didSelect: (sender, indexPath, data) => {
            const section = matrix.data[indexPath.section];
            const title = data.title.text;
            $ui.toast(`${section.title || "Untitled"} / ${title}`);
        },
        didLongPress: (sender, indexPath, data) => {
            const title = data.title.text;
            $ui.alert(`Long pressed ${title}`);
        },
    },
});
$ui.render({
    props: {
        navButtons: [
            {
                symbol: "plus",
                handler: () => {
                    const nextIndex = matrix.data[0].items.length + 1;
                    matrix.insert({
                        indexPath: $indexPath(0, matrix.data[0].items.length),
                        value: makeItem("Pinned", nextIndex),
                    });
                },
            },
            {
                symbol: "trash",
                handler: () => {
                    if (matrix.data[0].items.length === 0)
                        return;
                    matrix.delete($indexPath(0, matrix.data[0].items.length - 1));
                },
            },
        ],
    },
    views: [matrix.definition],
});
