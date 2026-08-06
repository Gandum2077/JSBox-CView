import {
  Blur,
  Button,
  Canvas,
  Chart,
  ClearView,
  Code,
  ContentView,
  DatePicker,
  Gallery,
  Gradient,
  Image,
  Input,
  Label,
  List,
  Lottie,
  Map,
  Markdown,
  MaskView,
  Matrix,
  Menu,
  Picker,
  Progress,
  Runtime,
  Scroll,
  SingleView,
  Slider,
  Spinner,
  Stack,
  Stepper,
  Switch,
  Tab,
  Text,
  Video,
  Web,
} from "../../index";

type ExampleView = { definition: UiTypes.AllViewOptions };
type Example = { title: string; make: () => ExampleView };

const centeredLabel = (text: string): UiTypes.LabelOptions => ({
  type: "label",
  props: {
    text,
    align: $align.center,
    lines: 0,
    font: $font("bold", 22),
  },
  layout: (make, view) => {
    make.left.right.inset(24);
    make.centerY.equalTo(view.super);
  },
});

const controlLayout = (make: MASConstraintMaker, view: AllUIView) => {
  make.center.equalTo(view.super);
  make.size.equalTo($size(240, 44));
};

const examples: Example[] = [
  {
    title: "SingleView",
    make: () =>
      new SingleView({
        type: "view",
        props: { bgcolor: $color("primarySurface") },
        layout: $layout.fill,
        views: [centeredLabel("通用原生视图包装器")],
      }),
  },
  {
    title: "ClearView",
    make: () => new ClearView({ views: [centeredLabel("透明容器")] }),
  },
  {
    title: "ContentView",
    make: () =>
      new ContentView({
        props: { bgcolor: $color("secondarySurface") },
        views: [centeredLabel("语义背景内容容器")],
      }),
  },
  {
    title: "MaskView",
    make: () => new MaskView({ views: [centeredLabel("拦截交互的半透明遮罩")] }),
  },
  {
    title: "Label",
    make: () =>
      new Label({
        props: { text: "Label", align: $align.center, font: $font("bold", 28) },
        layout: $layout.fill,
      }),
  },
  {
    title: "Button",
    make: () =>
      new Button({
        props: { title: "点击 Button" },
        layout: controlLayout,
        events: { tapped: () => $ui.toast("Button tapped") },
      }),
  },
  {
    title: "Input",
    make: () =>
      new Input({
        props: { placeholder: "单行输入", bgcolor: $color("secondarySurface"), radius: 8 },
        layout: controlLayout,
      }),
  },
  {
    title: "Slider",
    make: () => new Slider({ props: { value: 0.6 }, layout: controlLayout }),
  },
  {
    title: "Switch",
    make: () =>
      new Switch({
        props: { on: true },
        layout: (make, view) => make.center.equalTo(view.super),
      }),
  },
  {
    title: "Spinner",
    make: () =>
      new Spinner({
        props: { loading: true },
        layout: (make, view) => make.center.equalTo(view.super),
      }),
  },
  {
    title: "Progress",
    make: () => new Progress({ props: { value: 0.65 }, layout: controlLayout }),
  },
  {
    title: "Gallery",
    make: () =>
      new Gallery({
        props: {
          items: ["sun.max.fill", "moon.fill", "cloud.fill"].map((symbol) => ({
            type: "image",
            props: { symbol, contentMode: $contentMode.scaleAspectFit, tintColor: $color("systemLink") },
            layout: $layout.fill,
          })),
        },
        layout: $layout.fill,
      }),
  },
  {
    title: "Stepper",
    make: () =>
      new Stepper({
        props: { value: 2, min: 0, max: 10 },
        layout: (make, view) => make.center.equalTo(view.super),
      }),
  },
  {
    title: "Text",
    make: () =>
      new Text({
        props: { text: "多行 Text 视图\n可以在这里继续编辑。", font: $font(17) },
        layout: $layout.fillSafeArea,
      }),
  },
  {
    title: "Image",
    make: () =>
      new Image({
        props: { symbol: "photo", tintColor: $color("systemLink"), contentMode: $contentMode.scaleAspectFit },
        layout: $layout.fillSafeArea,
      }),
  },
  {
    title: "Video",
    make: () =>
      new Video({
        props: { src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
        layout: $layout.fillSafeArea,
      }),
  },
  {
    title: "Scroll",
    make: () =>
      new Scroll({
        props: { showsVerticalIndicator: true },
        layout: $layout.fill,
        events: {
          layoutSubviews: (sender) => {
            const content = sender.get("single-views-scroll-content");
            content.frame = $rect(0, 0, sender.frame.width, 900);
            sender.contentSize = $size(sender.frame.width, 900);
          },
        },
        views: [
          {
            type: "view",
            props: { id: "single-views-scroll-content" },
            views: Array.from({ length: 15 }, (_, index) => ({
              type: "label",
              props: { text: `Scroll row ${index + 1}`, align: $align.center },
              layout: (make, view) => {
                make.left.right.inset(16);
                make.top.equalTo(index * 60);
                make.height.equalTo(44);
              },
            })),
          },
        ],
      }),
  },
  {
    title: "Stack",
    make: () =>
      new Stack({
        props: {
          axis: $stackViewAxis.horizontal,
          distribution: $stackViewDistribution.fillEqually,
          spacing: 8,
          stack: {
            views: ["A", "B", "C"].map((text) => ({
              type: "label",
              props: { text, align: $align.center, bgcolor: $color("secondarySurface"), radius: 8 },
            })),
          },
        },
        layout: (make, view) => {
          make.left.right.inset(20);
          make.centerY.equalTo(view.super);
          make.height.equalTo(80);
        },
      }),
  },
  {
    title: "Tab",
    make: () => new Tab({ props: { items: ["First", "Second", "Third"] }, layout: controlLayout }),
  },
  {
    title: "Menu",
    make: () => new Menu({ props: { items: ["Newest", "Popular", "Saved"] }, layout: controlLayout }),
  },
  {
    title: "Map",
    make: () => new Map({ props: { location: { lat: 31.2304, lng: 121.4737 } }, layout: $layout.fillSafeArea }),
  },
  {
    title: "Web",
    make: () => new Web({ props: { url: "https://example.com" }, layout: $layout.fillSafeArea }),
  },
  {
    title: "List",
    make: () =>
      new List({
        props: { data: ["Alpha", "Beta", "Gamma", "Delta"] },
        layout: $layout.fill,
      }),
  },
  {
    title: "Matrix",
    make: () =>
      new Matrix({
        props: {
          columns: 3,
          itemHeight: 80,
          spacing: 8,
          data: Array.from({ length: 18 }, (_, index) => ({ tile: { text: `${index + 1}` } })),
          template: {
            views: [
              {
                type: "label",
                props: { id: "tile", align: $align.center, bgcolor: $color("secondarySurface"), radius: 8 },
                layout: $layout.fill,
              },
            ],
          },
        },
        layout: $layout.fill,
      }),
  },
  {
    title: "Blur",
    make: () => new Blur({ props: { style: 10 }, layout: $layout.fill, views: [centeredLabel("Blur background")] }),
  },
  {
    title: "Gradient",
    make: () =>
      new Gradient({
        props: {
          colors: [$color("systemPurple"), $color("systemBlue")],
          startPoint: $point(0, 0),
          endPoint: $point(1, 1),
        },
        layout: $layout.fill,
        views: [centeredLabel("Gradient")],
      }),
  },
  {
    title: "DatePicker",
    make: () =>
      new DatePicker({
        props: { date: new Date(), mode: 2 },
        layout: (make, view) => {
          make.left.right.inset(16);
          make.centerY.equalTo(view.super);
          make.height.equalTo(220);
        },
      }),
  },
  {
    title: "Picker",
    make: () =>
      new Picker({
        props: {
          items: [
            ["Red", "Green", "Blue"],
            ["Small", "Medium", "Large"],
          ],
        },
        layout: (make, view) => {
          make.left.right.inset(16);
          make.centerY.equalTo(view.super);
          make.height.equalTo(220);
        },
      }),
  },
  {
    title: "Canvas",
    make: () =>
      new Canvas({
        props: {},
        layout: $layout.fillSafeArea,
        events: {
          draw: (view, ctx) => {
            ctx.fillColor = $color("systemLink");
            ctx.fillRect($rect(40, 40, view.frame.width - 80, 120));
          },
        },
      }),
  },
  {
    title: "Markdown",
    make: () =>
      new Markdown({
        props: { content: "# Markdown\n\n- CView wrapper\n- Native JSBox view\n\n`jsbox-cview`" },
        layout: $layout.fillSafeArea,
      }),
  },
  {
    title: "Lottie",
    make: () =>
      new Lottie({
        props: {
          src: "https://assets10.lottiefiles.com/packages/lf20_usmfx6bp.json",
          loop: true,
        },
        layout: $layout.fillSafeArea,
        events: { ready: (sender) => sender.play({}) },
      }),
  },
  {
    title: "Chart",
    make: () =>
      new Chart({
        props: {
          options: {
            xAxis: { type: "category", data: ["A", "B", "C", "D"] },
            yAxis: { type: "value" },
            series: [{ type: "bar", data: [12, 20, 15, 28] }],
          },
        },
        layout: $layout.fillSafeArea,
      }),
  },
  {
    title: "Code",
    make: () =>
      new Code({
        props: {
          text: "const greeting = 'Hello, CView';\nconsole.log(greeting);",
          language: "javascript",
          lineNumbers: true,
        },
        layout: $layout.fillSafeArea,
      }),
  },
  {
    title: "Runtime",
    make: () =>
      new Runtime({
        props: { view: $objc("UISwitch").$new() },
        layout: (make, view) => {
          make.center.equalTo(view.super);
          make.size.equalTo($size(80, 44));
        },
      }),
  },
];

$ui.render({
  props: { title: "Single Views" },
  views: [
    {
      type: "list",
      props: { data: examples.map((example) => example.title) },
      layout: $layout.fill,
      events: {
        didSelect: (_sender, indexPath) => {
          const example = examples[indexPath.row];
          const cview = example.make();
          $ui.push({
            props: { title: example.title },
            views: [cview.definition],
          });
        },
      },
    },
  ],
});
