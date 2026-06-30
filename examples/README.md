# Examples

本目录包含可直接在 JSBox 中运行的 `jsbox-cview` 使用示例。示例统一从项目公共入口 `../index` 导入，用于同时验证公开导出是否完整。

## 运行示例

先安装依赖，然后指定一个示例入口进行编译和打包：

```sh
npm install
npm run build:debug --entry=./dist-debug/examples/dynamic-itemsize-matrix.js
```

命令会在项目根目录生成 `test.js`，将该文件放入 JSBox 中运行即可。把 `--entry` 改为下表中其他示例对应的编译路径，即可运行不同示例。

## 组件与视图

- [`custom-navigation-bar.ts`](./custom-navigation-bar.ts)：自定义导航栏及左右按钮。
- [`dynamic-contextmenu-view.ts`](./dynamic-contextmenu-view.ts)：运行时动态生成和切换上下文菜单。
- [`dynamic-itemsize-matrix.ts`](./dynamic-itemsize-matrix.ts)：根据容器宽度动态计算矩阵列数与项目尺寸。
- [`dynamic-itemsize-section-matrix.ts`](./dynamic-itemsize-section-matrix.ts)：带分组标题的动态尺寸矩阵。
- [`flowlayout.ts`](./flowlayout.ts)：按内容宽度排列的流式布局。
- [`oc-webview.ts`](./oc-webview.ts)：基于 `WKWebView` 的网页加载、导航和脚本执行。
- [`pageviewer.ts`](./pageviewer.ts)：可横向滑动的页面容器。
- [`pageviewer-titlebar.ts`](./pageviewer-titlebar.ts)：与页面切换联动的标题栏。
- [`refresh-button.ts`](./refresh-button.ts)：带加载状态的刷新按钮。
- [`searchbar.ts`](./searchbar.ts)：不同样式的搜索栏。

## 控制器

- [`pageviewer-controller.ts`](./pageviewer-controller.ts)：组合页面视图、标题栏和导航栏的分页控制器。
- [`splitview-controller.ts`](./splitview-controller.ts)：主内容与侧边栏组成的分栏控制器。
- [`tabbar-controller.ts`](./tabbar-controller.ts)：通过标签栏切换子控制器。

## 表单与弹窗

- [`dialog-sheet.ts`](./dialog-sheet.ts)：在 Sheet 中展示自定义 CView。
- [`form-dialog.ts`](./form-dialog.ts)：收集并校验表单值。
- [`dynamic-preference-listview.ts`](./dynamic-preference-listview.ts)：支持动态替换分组的设置列表。
- [`static-preference-listview.ts`](./static-preference-listview.ts)：使用独立单元格布局的静态设置列表。
