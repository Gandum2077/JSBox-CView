# JSBox-CView

为 JSBox 设计的微型框架。CView 主要实现 MVC 架构中 View、Controller 两部分。

CView 的含义是“组件化视图”。设计目的是：

- 通过组件化的方式，将 JSBox view 的定义和实例绑定，简化使用
- 方便地创建自定义组件

## View

CView 的视图组件是非侵入式的。换言之，你可以全部使用 CView 开发，也可以只使用你喜欢的某一个组件或方法。

它实现了 JSBox 原本的视图组件，同时增加了一些新的自定义组件。通过继承和组合，还可以创建更多的自定义组件。

## Controller

View 组件是收敛的，而 Controller 负责页面的构成和更新。
它可以实现一些常用的页面构建形式，比如底部 Tab 分页，左侧滑动分页，弹出式页面等。
