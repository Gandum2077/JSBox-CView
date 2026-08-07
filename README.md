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
- [`SearchBar`](./components/searchbar.ts)、[`SymbolButton`](./components/symbol-button.ts)、
  [`RefreshButton`](./components/refresh-button.ts)、[`RotatingView`](./components/rotating-view.ts) 与
  [`AndroidStyleSpinner`](./components/android-style-spinner.ts)：常用交互组件。

### Dialog、Sheet 与 Alert

- [`Sheet`](./components/sheet.ts) 与 [`DialogSheet`](./components/dialogs/dialog-sheet.ts)：展示任意 CView 的模态页面。
- [`formDialog`](./components/dialogs/form-dialog.ts)、[`listDialog`](./components/dialogs/list-dialog.ts) 和
  [`textDialog`](./components/dialogs/text-dialog.ts)：常用 Promise 风格 Dialog。
- [`inputAlert`](./components/alert/input-alert.ts)、[`loginAlert`](./components/alert/login-alert.ts)、
  [`plainAlert`](./components/alert/plain-alert.ts) 与 [`UIAlertController`](./components/alert/uialert.ts)：原生 Alert 封装。

### Controller

- [`BaseController`](./controller/base-controller.ts)：页面组合、生命周期和路由登记。
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
