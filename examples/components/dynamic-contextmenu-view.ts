import { DynamicContextMenuView } from "../../index";

let menuIndex = 0;
const menuList = [
  {
    title: "菜单1",
    items: [
      {
        title: "变成菜单1",
        symbol: "plus",
        handler: () => {
          menuIndex = 0;
        },
      },
      {
        title: "更多操作",
        symbol: "ellipsis.circle",
        items: [
          {
            title: "切换菜单",
            symbol: "arrow.triangle.2.circlepath",
            handler: () => {
              menuIndex = 1;
            },
          },
          {
            title: "危险操作",
            inline: true,
            items: [
              {
                title: "删除",
                symbol: "trash",
                destructive: true,
                handler: () => $ui.toast("已触发删除"),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: "变成菜单1",
        handler: () => {
          menuIndex = 0;
        },
      },
      {
        title: "变成菜单2",
        symbol: "2.circle",
        handler: () => {
          menuIndex = 1;
        },
      },
    ],
  },
];

const view = new DynamicContextMenuView({
  generateContextMenu: (sender) => {
    return menuList[menuIndex];
  },
  props: {},
  layout: (make, view) => {
    make.center.equalTo(view.super);
    make.size.equalTo($size(100, 100));
  },
  views: [
    {
      type: "label",
      props: {
        text: "长按我",
        textColor: $color("black"),
        align: $align.center,
      },
      layout: $layout.center,
    },
  ],
});

$ui.render({
  views: [view.definition],
});
