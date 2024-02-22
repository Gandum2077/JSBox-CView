"use strict";
/**
 * # CView List Dialog
 *
 * 显示一个列表以供选择
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDialog = void 0;
const dialog_sheet_1 = require("./dialog-sheet");
const single_views_1 = require("../single-views");
function listDialog({ items, multiSelectEnabled, value, values = [], title }) {
    if (value)
        values = [value];
    const listView = new single_views_1.List({
        props: {
            style: 2,
            data: items.map((n, i) => {
                return {
                    label: { text: n },
                    image: { hidden: !values.includes(i) }
                };
            }),
            template: {
                views: [
                    {
                        type: "label",
                        props: {
                            id: "label"
                        },
                        layout: (make, view) => {
                            make.top.bottom.inset(0);
                            make.left.inset(20);
                            make.right.inset(50);
                        }
                    },
                    {
                        type: "image",
                        props: {
                            id: "image",
                            symbol: "checkmark",
                            contentMode: 1,
                            tintColor: $color("systemLink")
                        },
                        layout: (make, view) => {
                            make.top.bottom.right.inset(10);
                            make.width.equalTo(30);
                        }
                    }
                ]
            }
        },
        events: {
            didSelect: (sender, indexPath) => {
                const data = sender.data;
                if (multiSelectEnabled) {
                    data[indexPath.item].image.hidden = !data[indexPath.item].image
                        .hidden;
                }
                else {
                    data.forEach((n, i) => {
                        n.image.hidden = i !== indexPath.item;
                    });
                }
                sender.data = data;
            }
        }
    });
    const sheet = new dialog_sheet_1.DialogSheet({
        title,
        bgcolor: $color("insetGroupedBackground"),
        cview: listView,
        doneHandler: () => {
            const filtered = listView.view.data
                .map((n, i) => (n.image.hidden ? -1 : i))
                .filter(n => n !== -1);
            if (multiSelectEnabled)
                return filtered;
            else
                return filtered[0];
        }
    });
    return new Promise((resolve, reject) => {
        sheet.promisify(resolve, reject);
        sheet.present();
    });
}
exports.listDialog = listDialog;
