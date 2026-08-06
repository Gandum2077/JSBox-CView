# Examples

本目录包含可直接在 JSBox 中运行的 `jsbox-cview` 使用示例。除作为所有组件基类的
`components/base.ts` 外，每个公开视图文件和控制器都有对应示例；`controller-router` 与
`controller-status` 是控制器辅助 API，由 `base-controller.ts` 一并演示。

示例统一从项目公共入口 `index.ts` 导入，因此也会验证公开导出是否完整。

## 运行示例

先安装依赖，然后指定一个示例入口进行编译和打包：

```sh
npm install
npm_config_entry=./dist-debug/examples/components/dynamic-itemsize-matrix.js npm run build:debug
```

命令会在项目根目录生成 `test.js`，将该文件放入 JSBox 中运行即可。把 `npm_config_entry` 改为下列示例对应的
`dist-debug` 路径，即可运行其他示例。

要一次性分别打包所有示例，运行：

```sh
npm run build:examples
```

命令会为每个 `examples/**/*.ts` 创建一个独立 bundle，并全部放入项目根目录的 `examples-dist/`。为避免不同子目录
出现同名文件，输出名称会用双下划线连接原相对路径，例如
`components/alert/input-alert.ts` 会生成 `components__alert__input-alert.js`。目录中的 `manifest.json` 记录完整映射。

## 基础视图与交互组件

- [`android-style-spinner.ts`](./components/android-style-spinner.ts)：基于 Lottie 的 Android 风格加载动画。
- [`custom-navigation-bar.ts`](./components/custom-navigation-bar.ts)：自定义导航栏及左右按钮。
- [`dynamic-contextmenu-view.ts`](./components/dynamic-contextmenu-view.ts)：运行时动态生成和切换上下文菜单。
- [`dynamic-itemsize-matrix.ts`](./components/dynamic-itemsize-matrix.ts)：根据容器宽度动态计算矩阵列数与项目尺寸。
- [`dynamic-itemsize-section-matrix.ts`](./components/dynamic-itemsize-section-matrix.ts)：支持自定义分组标题的动态尺寸矩阵。
- [`dynamic-preference-listview.ts`](./components/dynamic-preference-listview.ts)：支持动态替换分组的设置列表。
- [`dynamic-rowheight-list.ts`](./components/dynamic-rowheight-list.ts)：由行组件按可用宽度计算列表行高。
- [`enhanced-imageview.ts`](./components/enhanced-imageview.ts)：支持缩放、相对点击位置和手势资源释放的图片视图。
- [`flowlayout.ts`](./components/flowlayout.ts)：按内容宽度排列的流式布局。
- [`image-pager.ts`](./components/image-pager.ts)：支持缩放和动态图片地址的分页器。
- [`oc-webview.ts`](./components/oc-webview.ts)：基于 `WKWebView` 的网页加载、导航和脚本执行。
- [`page-control.ts`](./components/page-control.ts)：与 `PageViewer` 双向联动的原生分页指示器。
- [`pageviewer-titlebar.ts`](./components/pageviewer-titlebar.ts)：与页面切换联动的标题栏。
- [`pageviewer.ts`](./components/pageviewer.ts)：可横向滑动的页面容器。
- [`refresh-button.ts`](./components/refresh-button.ts)：带加载状态的刷新按钮。
- [`rotating-view.ts`](./components/rotating-view.ts)：可开始和停止的持续旋转视图。
- [`searchbar.ts`](./components/searchbar.ts)：不同样式的搜索栏。
- [`sheet.ts`](./components/sheet.ts)：使用原生控制器模态展示任意 CView。
- [`single-views.ts`](./components/single-views.ts)：可点击查看 `SingleView` 及全部 33 个专用原生视图包装器。
- [`static-preference-listview.ts`](./components/static-preference-listview.ts)：使用独立单元格布局的静态设置列表。
- [`symbol-button.ts`](./components/symbol-button.ts)：支持点击、动态图标和长按菜单的图标按钮。
- [`tabbar.ts`](./components/tabbar.ts)：不依赖控制器的底部标签栏。

## Alert 与 Dialog

- [`input-alert.ts`](./components/alert/input-alert.ts)：带单个输入框的原生 Alert。
- [`login-alert.ts`](./components/alert/login-alert.ts)：收集用户名和密码的原生 Alert。
- [`plain-alert.ts`](./components/alert/plain-alert.ts)：Promise 风格的确认与取消 Alert。
- [`uialert.ts`](./components/alert/uialert.ts)：直接组合底层 `UIAlertController`、文本框和操作。
- [`dialog-sheet.ts`](./components/dialogs/dialog-sheet.ts)：在带导航栏的 Sheet 中展示自定义 CView。
- [`form-dialog.ts`](./components/dialogs/form-dialog.ts)：收集并校验表单值。
- [`list-dialog.ts`](./components/dialogs/list-dialog.ts)：单选和多选列表弹窗。
- [`text-dialog.ts`](./components/dialogs/text-dialog.ts)：查看或编辑多行文本的弹窗。

## 控制器

- [`base-controller.ts`](./controller/base-controller.ts)：页面组合、生命周期、Router 登记与状态查询。
- [`pageviewer-controller.ts`](./controller/pageviewer-controller.ts)：组合页面视图、标题栏和导航栏的分页控制器。
- [`presented-page-controller.ts`](./controller/presented-page-controller.ts)：拥有控制器生命周期的原生模态页面。
- [`splitview-controller.ts`](./controller/splitview-controller.ts)：主内容与侧边栏组成的分栏控制器。
- [`tabbar-controller.ts`](./controller/tabbar-controller.ts)：通过标签栏切换子控制器。
