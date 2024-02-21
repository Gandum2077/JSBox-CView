/**
 * # CView List Dialog
 * 
 * 显示一个列表以供选择
 */

import { DialogSheet } from './dialog-sheet';
import { List } from '../single-views';

export function listDialog({ items, multiSelectEnabled, value, values = [], title }: {
  items: string[];
  multiSelectEnabled?: boolean;
  value?: number;
  values?: number[];
  title: string;
}) {
  if (value) values = [value]
  const listView = new List({
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
        } else {
          data.forEach((n, i) => {
            n.image.hidden = i !== indexPath.item;
          });
        }
        sender.data = data;
      }
    }
  })
  const sheet = new DialogSheet({
    title,
    bgcolor: $color("insetGroupedBackground"),
    cview: listView,
    doneHandler: () => {
      const filtered = listView.view.data
        .map((n, i) => (n.image.hidden ? -1 : i))
        .filter(n => n !== -1);
      if (multiSelectEnabled) return filtered;
      else return filtered[0];
    }
  });
  return new Promise((resolve, reject) => {
    sheet.promisify(resolve, reject);
    sheet.present();
  });
}
