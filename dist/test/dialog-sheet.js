"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dialog_sheet_1 = require("../components/dialogs/dialog-sheet");
const single_views_1 = require("../components/single-views");
const cview = new single_views_1.ContentView({
    props: {
        bgcolor: $color("lightGray"),
    },
    layout: $layout.fill,
});
$ui.render({
    views: [
        {
            type: "button",
            props: {
                title: "Show Dialog Sheet",
            },
            layout: $layout.center,
            events: {
                tapped: async () => {
                    const sheet = new dialog_sheet_1.DialogSheet({
                        title: "Dialog Sheet",
                        cview,
                        doneHandler: () => {
                            $ui.alert("Done");
                        },
                        presentMode: 1,
                        bgcolor: $color("white"),
                        doneButtonHidden: false,
                        doneButtonValidator: () => {
                            return true;
                        },
                        doneButtonTitle: "完成",
                    });
                    await sheet.present();
                },
            },
        },
    ],
});
