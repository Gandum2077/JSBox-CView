"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
                tapped: () => __awaiter(void 0, void 0, void 0, function* () {
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
                    yield sheet.present();
                }),
            },
        },
    ],
});
