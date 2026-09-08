import { DynamicContextMenuList, DynamicContextMenuMatrix } from "../../components/dynamic-contextmenu-collection";

// List 与 Matrix 共享收藏状态，页面最终移除时释放菜单交互。
const favorites = new Set<string>();
const data = ["Apple", "Banana", "Cherry"].map((id) => ({ id, label: { text: id } }));
const template = {
  views: [{ type: "label" as const, props: { id: "label", align: $align.center }, layout: $layout.fill }],
};
const ContextMenu = (sender: UIListView | UIMatrixView, indexPath: NSIndexPath, item: (typeof data)[number]) => ({
  title: item.id,
  items: [
    {
      title: favorites.has(item.id) ? "取消收藏" : "收藏",
      symbol: favorites.has(item.id) ? "star.fill" : "star",
      handler: () => {
        if (favorites.has(item.id)) favorites.delete(item.id);
        else favorites.add(item.id);
        $ui.toast(`${item.id}: ${favorites.has(item.id) ? "已收藏" : "已取消收藏"}，再次长按查看菜单`);
      },
    },
  ],
});
const openDemo = (kind: "list" | "matrix") => {
  const component =
    kind === "list"
      ? new DynamicContextMenuList({
          props: { template, data: [{ title: "水果列表", rows: data }], rowHeight: 48 },
          layout: $layout.fillSafeArea,
          events: { ContextMenu },
        })
      : new DynamicContextMenuMatrix({
          props: { template, data, columns: 3, itemHeight: 80, spacing: 10 },
          layout: $layout.fillSafeArea,
          events: { ContextMenu },
        });
  $ui.push({
    props: { title: `动态菜单 ${kind}` },
    views: [component.definition],
    events: {
      dealloc: () => component.dispose(),
    },
  });
};
$ui.render({
  props: { title: "动态收藏菜单" },
  views: [
    {
      type: "button",
      props: { title: "List 示例" },
      layout: (make, view) => {
        make.top.equalTo(view.super.safeArea).offset(30);
        make.centerX.equalTo(view.super);
        make.size.equalTo($size(220, 44));
      },
      events: { tapped: () => openDemo("list") },
    },
    {
      type: "button",
      props: { title: "Matrix 示例" },
      layout: (make, view) => {
        make.top.equalTo(view.super.safeArea).offset(100);
        make.centerX.equalTo(view.super);
        make.size.equalTo($size(220, 44));
      },
      events: { tapped: () => openDemo("matrix") },
    },
  ],
});
