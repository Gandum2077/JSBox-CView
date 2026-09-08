# JSBox-CView

[![CI](https://github.com/Gandum2077/JSBox-CView/actions/workflows/ci.yml/badge.svg)](https://github.com/Gandum2077/JSBox-CView/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/jsbox-cview)](https://www.npmjs.com/package/jsbox-cview)
[![license](https://img.shields.io/npm/l/jsbox-cview)](./LICENSE)

为 JSBox 设计的 TypeScript 组件与页面控制框架。CView 把 JSBox 的视图定义和实际 UIView 绑定为可复用组件，
并提供页面生命周期、导航容器、响应式网格、设置表单、Dialog、图片浏览和 WebView 等常用能力。

## 特点

- 与原生 JSBox View Definition 兼容，可以整页使用，也可以只采用一个组件。
- 使用 `Base` 和 `BaseController` 分离可复用视图行为与页面状态、数据加载和生命周期。
- 通过 TypeScript 类型约束组件属性、事件和表单结果。
- 包含可独立编译并在 JSBox 中运行的示例。

## 安装

```sh
npm install jsbox-cview
```

项目需要 JSBox 运行环境。TypeScript 全局类型由生产依赖 `jsbox-types` 提供；构建输出为 CommonJS，适合使用
Browserify 等工具打包为 JSBox 可执行脚本。

## 快速开始

```ts
import { BaseController, Label } from "jsbox-cview";

const message = new Label({
  props: {
    text: "Hello, CView",
    align: $align.center,
    font: $font("bold", 24),
  },
  layout: $layout.fill,
});

const controller = new BaseController();
controller.rootView.views = [message];
controller.uirender({ title: "CView" });
```

`definition` 用于把组件加入 JSBox 页面，`view` 用于在视图加载后访问对应的 UIView：

```ts
$ui.render({ views: [message.definition] });
$delay(1, () => (message.view.text = "视图已加载"));
```

不要在组件加入界面前访问 `.view`；此时 JSBox 还无法通过组件 ID 找到真实视图。

## 组件与控制器

CView 使用两层职责：

| 层         | 基类             | 负责内容                                     |
| ---------- | ---------------- | -------------------------------------------- |
| Component  | `Base`           | 可复用视图、局部交互、公开的属性与方法       |
| Controller | `BaseController` | 页面组合、数据请求、导航、生命周期与资源释放 |

常见场景可以从这些高层组件开始：

| 场景                       | 推荐 API                                                |
| -------------------------- | ------------------------------------------------------- |
| 普通页面                   | `BaseController` + `CustomNavigationBar`                |
| 带输入框的页面             | `KeyboardAvoidanceController`                           |
| 底部或侧边 Tab             | `TabBarController`                                      |
| 横向分页页面               | `PageViewerController`                                  |
| 主内容与侧栏               | `SplitViewController`                                   |
| 动态设置或表单             | `DynamicPreferenceListView`                             |
| 静态精细设置布局           | `PreferenceListView`                                    |
| 响应式网格                 | `DynamicItemSizeMatrix`                                 |
| 带分区标题的响应式网格     | `DynamicItemSizeSectionMatrix`                          |
| 动态图片分页               | `ImagePager`                                            |
| 登录或 Cloudflare Web 流程 | `OCWebView`                                             |
| 简单弹窗或表单             | `listDialog`、`formDialog`、`textDialog`、Alert helpers |

## 示例：动态的设置列表

```ts
import { DynamicPreferenceListView } from "jsbox-cview";

interface Settings {
  name: string;
  enabled: boolean;
  volume: number;
}

const preferences = new DynamicPreferenceListView<Settings>({
  props: {},
  sections: [
    {
      title: "通用",
      rows: [
        { type: "string", key: "name", title: "名称", value: "CView" },
        { type: "boolean", key: "enabled", title: "启用", value: true },
        { type: "slider", key: "volume", title: "音量", min: 0, max: 100, value: 50, decimal: 0 },
      ],
    },
  ],
  layout: $layout.fill,
  events: {
    changed: (values) => $cache.set("settings", values),
  },
});

const current: Settings = preferences.values;
```

未提供 `value` 时，Stepper、Switch、Slider 和 Tab 会分别采用 `min ?? 0`、`false`、`min ?? 0` 和 `-1`。
`info`、`link`、`action` 等展示或操作行不会进入 `values`。

## 示例：响应式网格

```ts
import { DynamicItemSizeMatrix } from "jsbox-cview";

const matrix = new DynamicItemSizeMatrix({
  props: {
    data: cards,
    template: {
      views: [{ type: "label", props: { id: "title" }, layout: $layout.fill }],
    },
    itemLayoutOptions: {
      minItemWidth: 120,
      maxColumns: 4,
      spacing: 8,
      itemHeight: (width) => width * 0.75,
    },
  },
  layout: $layout.fill,
  events: {
    didSelect: (_sender, indexPath) => console.log(indexPath.item),
  },
});
```

组件会在 JSBox 报告容器宽度变化时重新计算列数和尺寸。需要把网格嵌入动态高度布局时，可调用
`matrix.heightToWidth(width)` 获取完整内容高度。

## 更多示例

完整目录见 [`examples`](./examples/README.md)。一次性验证并打包全部示例：

```sh
npm install
npm run build:examples
```

产物位于忽略提交的 `examples-dist/`。也可以指定单个编译入口生成 `test.js`：

```sh
npm_config_entry=./dist-debug/examples/components/dynamic-itemsize-matrix.js npm run build:debug
```

## API 导览

### 基础视图与复合组件

- [`Base`](./components/base.ts) 与 [`single-views`](./components/single-views.ts)：组件基类及原生视图包装器。
- [`CustomNavigationBar`](./components/custom-navigation-bar.ts)、[`TabBar`](./components/tabbar.ts)、
  [`PageViewer`](./components/pageviewer.ts) 与 [`PageViewerTitleBar`](./components/pageviewer-titlebar.ts)：页面导航和分页。
- [`DynamicItemSizeMatrix`](./components/dynamic-itemsize-matrix.ts)、
  [`DynamicItemSizeSectionMatrix`](./components/dynamic-itemsize-section-matrix.ts)、
  [`DynamicRowHeightList`](./components/dynamic-rowheight-list.ts) 与 [`Flowlayout`](./components/flowlayout.ts)：动态列表与网格。
- [`PreferenceListView`](./components/static-preference-listview.ts) 与
  [`DynamicPreferenceListView`](./components/dynamic-preference-listview.ts)：设置和表单。
- [`EnhancedImageView`](./components/enhanced-imageview.ts)、[`ImagePager`](./components/image-pager.ts)、
  [`PageControl`](./components/page-control.ts) 与 [`OCWebView`](./components/oc-webview.ts)：图片、分页与网页。
- [`LoadableContentView`](./components/loadable-content-view.ts)：加载、内容、空结果与错误四态页面容器。
- [`SearchBar`](./components/searchbar.ts)、[`SymbolButton`](./components/symbol-button.ts)、
  [`RefreshButton`](./components/refresh-button.ts)、[`RotatingView`](./components/rotating-view.ts) 与
  [`AndroidStyleSpinner`](./components/android-style-spinner.ts)：常用交互组件。
- [`DynamicContextMenuView`](./components/dynamic-contextmenu-view.ts)：每次打开时生成最新菜单，支持 JSBox 的 SF Symbol、
  危险操作、多层子菜单与 inline 分组。

### Dialog、Sheet 与 Alert

- [`Sheet`](./components/sheet.ts) 与 [`DialogSheet`](./components/dialogs/dialog-sheet.ts)：展示任意 CView 的模态页面。
- [`formDialog`](./components/dialogs/form-dialog.ts)、[`listDialog`](./components/dialogs/list-dialog.ts) 和
  [`textDialog`](./components/dialogs/text-dialog.ts)：常用 Promise 风格 Dialog。
- [`inputAlert`](./components/alert/input-alert.ts)、[`loginAlert`](./components/alert/login-alert.ts)、
  [`plainAlert`](./components/alert/plain-alert.ts) 与 [`UIAlertController`](./components/alert/uialert.ts)：原生 Alert 封装。

### Controller

- [`BaseController`](./controller/base-controller.ts)：页面组合、生命周期和路由登记。
- [`KeyboardAvoidanceController`](./controller/keyboard-avoidance-controller.ts)：根据键盘有效高度缩小页面根视图，避免底部内容被停靠键盘遮挡。
- [`PageViewerController`](./controller/pageviewer-controller.ts)：横向分页子控制器。
- [`TabBarController`](./controller/tabbar-controller.ts)：Tab 子控制器切换。
- [`SplitViewController`](./controller/splitview-controller.ts)：主页面与侧栏。
- [`PresentedPageController`](./controller/presented-page-controller.ts)：带生命周期的模态控制器。

## 从 1.x 升级

2.0 调整了 `Base`、动态尺寸网格、分区网格和导航栏 API，并移除了 `DualRing`、`Wedges` 和旧的 Spinner
深层导入路径。完整变更和替代写法见 [`CHANGELOG.md`](./CHANGELOG.md#从-1x-迁移)。

## 开发与发布检查

```sh
npm ci
npm run check
```

`npm run check` 会依次执行：

1. 严格 TypeScript 类型检查和 ESLint。
2. Prettier 格式检查。
3. 构建库并运行 Node 内置测试框架中的回归测试。
4. 编译并打包全部 JSBox 示例。
5. 运行 `npm pack --dry-run`，验证 `prepack` 会清理旧 `dist`，并检查发布包的必需和禁止文件。

同一流程配置在 [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)，每次 push 和 pull request 都会自动执行。
只有 CI 通过、`npm audit --omit=dev` 为零，并且干净检出的 `npm pack --dry-run` 内容正确时才应创建发布标签。

## License

[MIT](./LICENSE)

### 动态 List / Matrix ContextMenu

`DynamicContextMenuList` / `DynamicContextMenuMatrix` 的构造参数与原生组件一致（省略 `type`），增加
`events.ContextMenu: (sender, indexPath, data) => UiTypes.ContextMenuOptions<T> | null | undefined`。
事件名大小写敏感，必须同步返回；`null`、`undefined` 或空 `items` 禁用该项菜单。

```ts
const favorites = new Set<string>();
const list = new DynamicContextMenuList({
  props: { data: ["Apple", "Banana"] },
  layout: $layout.fill,
  events: {
    ContextMenu: (sender, indexPath, data) => ({
      items: [
        {
          title: favorites.has(data) ? "取消收藏" : "收藏",
          symbol: favorites.has(data) ? "star.fill" : "star",
          handler: () => {
            if (favorites.has(data)) favorites.delete(data);
            else favorites.add(data);
          },
        },
      ],
    }),
  },
});
// 将 list.definition 加入视图；页面最终移除时调用 list.dispose()。
```

实现保留 JSBox `list` / `matrix`，在 `ready` 时添加独立的 `UIContextMenuInteraction`。
Runtime 对象只实现 `UIContextMenuInteractionDelegate`，不读取或替换 JSBox 的 delegate/dataSource，
也不覆盖 `respondsToSelector:` / `forwardingTargetForSelector:`。长按时用交互所在视图的本地坐标调用
`indexPathForRowAtPoint:` / `indexPathForItemAtPoint:`，空白区域返回空菜单配置。
不修改系统类，不重建 cell。每次请求菜单使用 `sender.object(indexPath)` 读取当前数据，
因此适用于分区、重新赋值、插入和删除后的数据。菜单 action 的 handler 保持 `(sender, indexPath)` 签名；
额外业务数据可由 ContextMenu 闭包捕获。菜单已显示期间数据可能移动，请用稳定业务 ID 执行修改，勿依赖旧位置。

| 能力                                                                                        | 实现范围 / 限制                                                                                    |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| data、template、分区、header/footer、cell/object、insert/delete/reload、scrollTo            | 继续使用原生 JSBox 实现；通过 `.view` 调用原生方法                                                 |
| List 动态/自动行高、分区高度、侧滑 actions；Matrix columns、spacing、方向、自动尺寸、瀑布流 | 原生属性、数据源和 delegate 保留；尚未完成 iOS 真机兼容验证                                        |
| didSelect、滚动/刷新、forEachItem、highlighted、尺寸事件、排序回调                          | 原样传入 JSBox，原 delegate 不变，需真机回归                                                       |
| 菜单标题、SF Symbol、destructive、递归子菜单、inline                                        | 支持；子菜单的 handler 与 JSBox 一样忽略                                                           |
| props.menu                                                                                  | 由 ContextMenu 接管；禁止同时设置，也不要通过 Runtime 另行改菜单或 delegate                        |
| pullDown / asPrimary                                                                        | 不支持；返回 true 时抛出错误。这两个选项属于 button/navButtons                                     |
| didLongPress / 长按排序与菜单同时触发                                                       | 回调与属性保留，但手势竞争尚未验证，不保证同一次长按同时生效；示例默认不开启 reorder               |
| 自定义预览、预览提交、菜单显示/消失回调                                                     | 未提供；使用独立交互的单元格 targeted preview；不复用 JSBox 菜单生命周期                           |
| Matrix 多选聚合菜单                                                                         | 未实现；按长按位置只生成单项菜单                                                                   |
| 异步菜单、已打开菜单实时刷新                                                                | 未实现；下次系统请求时重新生成                                                                     |
| 生命周期                                                                                    | owning controller 的 `events.didRemove` 调用 `dispose()`；幂等移除交互并 release。临时消失不要释放 |

最低要求 iOS 13 的 UIKit Context Menu API。每个加载的视图有独立交互与 delegate；一个组件重复加载的交互会在
`dispose()` 一并清理。Runtime 类注册持续到脚本退出，但 dispose 清空其业务状态。
如果 JSBox 将来改变 `ocValue()` 的类型，组件会明确报错。JSBox 自带交互与新增交互之间的手势竞争仍需真机验证，
不应同时配置静态菜单、模板子视图菜单或依赖同一次长按同时排序。

真机状态：用户已确认独立交互版本运行成功。完整功能组合仍需按实际使用场景验证。

Node mock 回归覆盖菜单重新生成、当前数据读取、分区位置、命中测试、空白区域、action、子菜单、预览目标和释放，
并禁止实现触碰原 delegate 或定义 NSObject 分发方法。这些测试不验证 JSBox 的 Objective-C 桥接或真实手势。

[收藏示例](./examples/components/dynamic-contextmenu-collection.ts) 分别展示 List / Matrix，共享收藏状态，
并在页面最终移除时调用 `dispose()`。其他功能组合可按需验证：分区及数据替换/插删、滚动与点击、尺寸回调、
侧滑编辑、长按排序，以及页面关闭后重新打开。

实现依据：本地 jsbox-docs 的 `component/list.md`、`component/matrix.md`、`uikit/context-menu.md` 和 Runtime 文档；
[Apple UIContextMenuInteractionDelegate](https://developer.apple.com/documentation/uikit/uicontextmenuinteractiondelegate)。
