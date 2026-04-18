"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const form_dialog_1 = require("../components/dialogs/form-dialog");
$ui.render({
    views: [
        {
            type: "button",
            props: {
                title: "Show Form Dialog",
            },
            layout: $layout.center,
            events: {
                tapped: async () => {
                    const values = await (0, form_dialog_1.formDialog)({
                        sections: [
                            {
                                title: "Section 1",
                                rows: [
                                    {
                                        type: "boolean",
                                        title: "Switch",
                                        key: "switch",
                                        value: true,
                                    },
                                    {
                                        type: "string",
                                        title: "String",
                                        key: "string",
                                        value: "Hello, World!",
                                    },
                                ],
                            },
                        ],
                        title: "Form Dialog",
                        checkHandler: (values) => {
                            console.log(values);
                            if (values.switch)
                                return true;
                            else
                                return false;
                        },
                    });
                    $ui.alert({
                        title: "Values",
                        message: JSON.stringify(values, null, 2),
                    });
                },
            },
        },
    ],
});
