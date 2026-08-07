# Changelog

本文件记录 `jsbox-cview` 的重要变更。版本格式遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)，
内容组织参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [Unreleased]

## [2.0.0] - 2026-08-07

### Added

- 为公共组件、控制器、事件和配置补齐 TypeScript 类型与 TSDoc。
- `PreferenceListView<TValues>`、`DynamicPreferenceListView<TValues>` 和 `formDialog<TValues>` 支持为返回值指定业务类型。
- `DynamicItemSizeMatrix` 与 `DynamicItemSizeSectionMatrix` 新增尺寸、列数、总宽度等只读状态，以及
  `resetItemLayoutOptions()` 动态更新布局参数。
- `CustomNavigationBar` 新增 `NavBarState` 和可控制动画的 `setStyle()`。
- 新增 35 个可独立编译、打包并在 JSBox 中运行的组件与控制器示例。
- 新增 `npm run check` 发布门禁和 GitHub Actions CI，覆盖类型检查、lint、格式、回归测试、示例构建与 npm 包预检。

### Changed

- `Base.definition` 统一为根视图注入组件 `id`；自定义组件不再需要在 `_defineView()` 中手动设置根 `props.id`。
- `Base._defineView` 改为 `protected`，只作为组件子类的实现细节使用。
- `DynamicItemSizeMatrix` 将尺寸参数集中到必填的 `props.itemLayoutOptions`；`itemHeight` 现在同时支持固定数字和宽度函数。
- `DynamicItemSizeSectionMatrix` 使用统一的 `DynamicItemSizeSectionMatrixSection` 数据结构；字符串和自定义模板标题可以在同一数据集中使用。
- 分区标题为 `undefined` 或空字符串时均不再创建标题单元格。
- `CustomNavigationBar` 的显示状态使用 `NavBarState` 表达；状态切换统一由 `style` 或 `setStyle()` 完成。
- 偏好设置列表现在明确保存控件默认值：Stepper 使用 `min ?? 0`，Switch 使用 `false`，Slider 使用 `min ?? 0`，Tab 使用 `-1`。
- Alert、Dialog、Sheet、Controller 和大多数复合组件的参数与事件改为具名导出类型。
- Android 风格 Spinner 源文件移动到 `components/android-style-spinner.ts`，公共类名仍为 `AndroidStyleSpinner`。

### Fixed

- 修复未传入 Slider `value` 时静态偏好列表调用 `undefined.toFixed()` 的崩溃。
- 修复 Stepper 的 `value: 0` 被 `min` 覆盖，以及 Slider 非零最小值区间映射错误。
- 修复日期选择 `mode: 0` 被默认模式覆盖的问题。
- 修复 `PageViewer` 在首次取得页面宽度之前计算滚动页码可能产生 `NaN` 的问题。
- 修复 `listDialog` 单选模式未选择项目时可能把 `undefined` 当作 `number` 返回的问题；多选模式仍允许返回空数组。
- 修复 `CustomNavigationBar` 从扩展状态恢复后工具区域仍然可见的问题，并补齐非普通初始状态下的子视图可见性。
- `prepack` 现在先清理 `dist` 再构建，避免把历史构建遗留文件发布到 npm。

### Removed

- 移除 `DualRing` 和 `Wedges` 加载动画及对应导出。
- 移除 `components/spinners/spinner-androidstyle` 旧深层导入路径。
- 移除 `DynamicItemSizeMatrix` 的 `fixedItemHeight`、`dynamicHeightEnabled`、`events.itemHeight` 和
  `events.heightChanged` 旧配置方式。
- 移除 `DynamicItemSizeSectionMatrixAnySection`、`DynamicItemSizeSectionMatrixCustomSection`、
  `DynamicItemSizeSectionMatrixTitleTemplate` 和组件泛型参数。

## 从 1.x 迁移

### 自定义 Base 组件

根视图的 `id` 由 `Base.definition` 自动注入。删除自定义组件根定义中的 `id: this.id`：

```ts
class Badge extends Base<UIView, UiTypes.ViewOptions> {
  protected _defineView = () => ({
    type: "view" as const,
    props: {},
    layout: $layout.fill,
  });
}
```

### DynamicItemSizeMatrix

把原先分散在 `props` 和 `events` 中的尺寸选项移动到 `props.itemLayoutOptions`：

```ts
const matrix = new DynamicItemSizeMatrix({
  props: {
    data,
    template,
    itemLayoutOptions: {
      minItemWidth: 120,
      maxColumns: 4,
      spacing: 8,
      itemHeight: (width) => width * 0.75,
    },
  },
  layout: $layout.fill,
  events: {},
});
```

原来的 `dynamicHeightEnabled` 和 `heightChanged` 已移除。需要内容高度时调用 `matrix.heightToWidth(width)`，
再由外层组件更新高度约束。

### DynamicItemSizeSectionMatrix

同样把尺寸与标题模板放到 `itemLayoutOptions`。`data` 现在是必填的统一分区数组：

```ts
const matrix = new DynamicItemSizeSectionMatrix({
  props: {
    data: [
      { title: "普通标题", items: firstItems },
      { title: { title: { text: "模板标题" } }, titleHeight: 44, items: secondItems },
    ],
    template,
    itemLayoutOptions: {
      minItemWidth: 120,
      maxColumns: 4,
      spacing: 8,
      itemHeight: 96,
      sectionTitleTemplate,
    },
  },
  layout: $layout.fill,
  events: {},
});
```

如果过去使用空字符串标题来保留空白标题行，请改为显式的自定义标题数据和 `titleHeight`。

### CustomNavigationBar

用状态枚举替代直接调用旧的布局方法：

```ts
navigationBar.setStyle(NavBarState.Expanded);
navigationBar.setStyle(NavBarState.Normal, false); // 不使用动画

// 属性写法仍然可用
navigationBar.style = NavBarState.Minimized;
```

### Spinner

从包入口导入 `AndroidStyleSpinner`。不要继续深层导入 `components/spinners/*`：

```ts
import { AndroidStyleSpinner } from "jsbox-cview";
```

[Unreleased]: https://github.com/Gandum2077/JSBox-CView/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/Gandum2077/JSBox-CView/compare/v1.6.11...v2.0.0
