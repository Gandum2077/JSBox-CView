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
                tapped: () => __awaiter(void 0, void 0, void 0, function* () {
                    const values = yield (0, form_dialog_1.formDialog)({
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
                }),
            },
        },
    ],
});
