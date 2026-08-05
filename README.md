# JSBox-CView

为 JSBox 设计的微型框架。CView 主要实现 MVC 架构中 View、Controller 两部分。

CView 的含义是“组件化视图”。设计目的是：

- 通过组件化的方式，将 JSBox view 的定义和实例绑定，简化使用
- 方便地创建自定义组件

## View

CView 的视图组件是非侵入式的。换言之，你可以全部使用 CView 开发，也可以只使用你喜欢的某一个组件或方法。

它实现了 JSBox 原本的视图组件，同时增加了一些新的自定义组件。通过继承和组合，还可以创建更多的自定义组件。

[Base](./components/base.ts): 所有 CView 组件的抽象基类，负责绑定视图定义、实例与通用的子视图操作。

[SingleView 与基础视图](./components/single-views.ts): 将 JSBox 原生视图统一封装为可组合的 CView 组件。

[CustomNavigationBar](./components/custom-navigation-bar.ts): 提供支持多种高度模式、自定义标题和左右按钮的导航栏。

[TabBar](./components/tabbar.ts): 提供可配置图标、标题和选中状态的 iOS 风格标签栏。

[PageViewer](./components/pageviewer.ts): 提供可横向滑动翻页并报告连续滚动进度的页面容器。

[PageViewerTitleBar](./components/pageviewer-titlebar.ts): 提供与 PageViewer 联动的可点击、可滑动标题栏。

[Flowlayout](./components/flowlayout.ts): 将不同宽度的项目按固定间距左对齐排列并自动换行。

[DynamicItemSizeMatrix](./components/dynamic-itemsize-matrix.ts): 根据容器宽度、最小项目宽度和间距动态计算矩阵的列数与项目尺寸。

[DynamicItemSizeSectionMatrix](./components/dynamic-itemsize-section-matrix.ts): 在动态尺寸矩阵中加入分组标题并自动转换数据与索引。

[DynamicRowHeightList](./components/dynamic-rowheight-list.ts): 根据每行 CView 报告的宽高关系自动计算并更新列表行高。

[DynamicContextMenuView](./components/dynamic-contextmenu-view.ts): 通过 Objective-C Runtime 为视图动态生成和更新上下文菜单。

[DynamicPreferenceListView](./components/dynamic-preference-listview.ts): 提供可动态替换分组和数据的设置列表。

[PreferenceListView](./components/static-preference-listview.ts): 提供由独立静态单元格组成、支持多种输入类型的设置列表。

[EnhancedImageView](./components/enhanced-imageview.ts): 提供缩放浏览以及获取点击相对位置的增强图片视图。

[ImagePager](./components/image-pager.ts): 提供适合大量或动态图片数据的可刷新分页浏览器。

[OCWebView](./components/oc-webview.ts): 基于 WKWebView 提供网页加载、导航和脚本执行能力，并支持 Cloudflare 人机检测流程。

[SearchBar](./components/searchbar.ts): 提供多种样式以及焦点、取消和文本变化事件的搜索框。

[PageControl](./components/page-control.ts): 基于 Objective-C Runtime 封装可交互的原生页面指示器。

[SymbolButton](./components/symbol-button.ts): 提供统一图标尺寸与边距的 SF Symbol 或图片按钮。

[RefreshButton](./components/refresh-button.ts): 在刷新图标和加载动画之间自动切换状态的按钮。

[RotatingView](./components/rotating-view.ts): 为图片或自定义 CView 提供可控制方向与速度的连续旋转效果。

## 表单与弹窗

[Sheet](./components/sheet.ts): 使用独立 UIViewController 以 pageSheet 或 formSheet 方式呈现任意 CView。

[DialogSheet](./components/dialogs/dialog-sheet.ts): 在带导航栏和完成按钮的 Sheet 中呈现自定义 CView，并支持结果验证与 Promise 回调。

[formDialog](./components/dialogs/form-dialog.ts): 根据 PreferenceListView 分组定义展示表单，并在校验后返回填写结果。

[listDialog](./components/dialogs/list-dialog.ts): 以列表弹窗提供单选或多选，并返回所选项目的索引。

[textDialog](./components/dialogs/text-dialog.ts): 以可编辑文本视图收集或展示文本，并通过 Promise 返回内容。

[UIAlertController 与 UIAlertAction](./components/alert/uialert.ts): 封装原生 UIAlertController、操作按钮和输入框的底层构建能力。

[plainAlert](./components/alert/plain-alert.ts): 显示包含标题、正文以及确认和取消操作的文字提示框。

[inputAlert](./components/alert/input-alert.ts): 显示单个文本输入框，并通过 Promise 返回用户输入。

[loginAlert](./components/alert/login-alert.ts): 显示用户名与密码输入框，并通过 Promise 返回登录信息。

## Controller

View 组件是收敛的，而 Controller 负责页面的构成和更新。
它可以实现一些常用的页面构建形式，比如底部 Tab 分页，左侧滑动分页，弹出式页面等。

[BaseController](./controller/base-controller.ts): 提供根视图、生命周期、路由注册以及页面渲染和入栈能力的控制器基类。

[PageViewerController](./controller/pageviewer-controller.ts): 组合导航栏、标题栏和 PageViewer 来管理可横向切换的子控制器。

[PresentedPageController](./controller/presented-page-controller.ts): 管理以 Sheet 形式呈现和关闭的页面及其生命周期。

[SplitViewController](./controller/splitview-controller.ts): 管理主内容与可滑出侧栏组成的双控制器分栏页面。

[TabBarController](./controller/tabbar-controller.ts): 通过底部标签栏切换子控制器并同步其显示生命周期。

## 示例

可运行示例及使用说明见 [`examples`](./examples/README.md)。
