"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_preference_listview_1 = require("../components/static-preference-listview");
const sections = [
    {
        title: "Section 1",
        rows: [
            {
                type: "string",
                title: "string",
                key: "string",
                value: "测试一号测试二号测试三号测试四号测试五号测试六号",
            },
            {
                type: "number",
                title: "number",
                key: "number",
                value: 1111.1,
            },
            {
                type: "integer",
                title: "integer",
                key: "integer",
                value: 1111,
            },
            {
                type: "stepper",
                title: "stepper",
                key: "stepper",
                value: 2,
                min: 2,
                max: 5,
            },
        ],
    },
    {
        title: "Section 2",
        rows: [
            {
                type: "boolean",
                title: "boolean",
                key: "boolean",
                value: true,
            },
            {
                type: "slider",
                title: "slider",
                key: "slider",
                value: 1,
                decimal: 0,
                min: 0,
                max: 100,
            },
            {
                type: "list",
                title: "list",
                key: "list",
                items: ["测试一号", "测试bbb"],
                value: 0,
            },
            {
                type: "tab",
                title: "tab",
                key: "tab",
                items: ["测试aaa", "测试bbb"],
                value: 0,
            },
            {
                type: "date",
                title: "date",
                key: "date",
                //value: new Date()
                mode: 1,
            },
        ],
    },
    {
        title: "Section 3",
        rows: [
            {
                type: "info",
                title: "info",
                value: "this is info",
            },
            {
                type: "link",
                title: "link",
                value: "https://apple.com",
            },
            {
                type: "symbol-action",
                title: "种类1",
                symbol: "checkmark",
                tintColor: $color("systemLink"),
                titleColor: $color("systemLink"),
                value: () => console.info(0),
            },
            {
                type: "action",
                title: "action",
                value: () => console.info(0),
            },
        ],
    },
    {
        title: "Section 4",
        rows: [
            {
                type: "interactive-info",
                title: "interactive-info",
                key: "interactive-info",
                value: "测试一号测试二号测试三号测试四号测试五号测试六号",
            },
            {
                type: "interactive-info",
                title: "interactive-info2",
                key: "interactive-info2",
                value: "测试一号测试二号测试三号测试四号测试五号测试六号",
                copyable: true,
            },
        ],
    },
];
const v = new static_preference_listview_1.PreferenceListView({
    props: { data: [] },
    sections: sections,
    layout: $layout.fill,
    events: {
        changed: (values) => console.info(values),
    },
});
$ui.render({
    props: {
        title: "",
        navButtons: [
            {
                symbol: "plus",
                handler: () => { },
            },
        ],
    },
    views: [v.definition],
});
