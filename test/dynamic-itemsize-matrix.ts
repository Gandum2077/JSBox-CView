import { DynamicItemSizeMatrix } from "../components/dynamic-itemsize-matrix";

const matrix = new DynamicItemSizeMatrix({
  props: {
    spacing: 5,
    minItemWidth: $device.isIpad ? 140 : 118,
    maxColumns: 10,
    template: {
      views: [
        {
          type: "label",
          props: {
            id: "label",
            align: $align.center,
            font: $font(13)
          },
          layout: (make, view) => {
            make.left.right.bottom.inset(0);
            make.height.equalTo(20);
          }
        },
        {
          type: "image",
          props: {
            symbol: "sun.dust",
            bgcolor: $color("backgroundColor", "secondarySurface"),
            contentMode: $contentMode.scaleAspectFit
          },
          layout: (make, view) => {
            make.top.left.right.equalTo(0);
            make.bottom.equalTo(view.prev.top);
          }
        }
      ]
    },
    data: [...Array(100)].map((n, i) => {
      return {
        label: { text: i + 1 }
      };
    }),
    footer: {
      type: "view",
      props: {
        height: 20
      }
    }
  },
  layout: (make, view) => {
    make.left.right.equalTo(view.super.safeArea);
    make.top.bottom.equalTo(view.super);
  },
  events: {
    itemHeight: width => width * 1.414 + 20,
    didSelect: (sender, indexPath, data) => { },
    didScroll: sender => { 
      matrix.columns
      console.log(sender.contentOffset.y)
      console.log(Math.ceil(sender.contentOffset.y / (matrix.itemSize.height + 5)))
      console.log(Math.ceil(sender.contentOffset.y / (matrix.itemSize.height + 5)) * matrix.columns)
    },
  }
});

$ui.render({
  props: {
    navButtons: [
      {
        symbol: "plus",
        handler: () => matrix.data = [{ label: { text: "New" } }]
      }
    ]
  },
  views: [matrix.definition],
});