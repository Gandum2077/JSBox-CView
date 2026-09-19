const assert = require("node:assert/strict");
const test = require("node:test");
const registry = new Map();
const native = new Proxy({}, { get: (_target, key) => (key === "$new" ? () => native : () => undefined) });
Object.assign(globalThis, {
  $: (id) => registry.get(id),
  $color: (name) => name,
  $font: (size) => ({ size }),
  $layout: { fill: () => {}, fillSafeArea: () => {} },
  $objc: () => native,
  $UIEvent: { valueChanged: 1 },
  $block: (_type, handler) => handler,
  $rect: (x, y, width, height) => ({ x, y, width, height }),
  $size: (width, height) => ({ width, height }),
  $point: (x, y) => ({ x, y }),
});
const { WelcomeView } = require("../dist/components/welcome-view");
const { ContentView } = require("../dist/components/single-views");
function mount(definition) {
  const view = {
    ...definition.props,
    scrollToOffset(offset) {
      this.contentOffset = offset;
    },
    frame: { width: 0, height: 0 },
    contentOffset: { x: 0, y: 0 },
    constraints: {},
    children: [],
    updateLayout(callback) {
      const maker = new Proxy(
        {},
        {
          get: (_target, key) => {
            const keys = [key];
            const chain = new Proxy(
              {},
              {
                get: (_target, attribute) => {
                  if (attribute === "equalTo")
                    return (value) => {
                      for (const name of keys) this.constraints[name] = value;
                      return chain;
                    };
                  keys.push(attribute);
                  return chain;
                },
              },
            );
            return chain;
          },
        },
      );
      callback(maker, this);
    },
    setNeedsLayout() {},
    layoutIfNeeded() {
      for (const child of this.children) {
        const { width, height, top, left, centerX } = child.constraints;
        if (typeof width === "number") child.frame.width = width;
        if (typeof height === "number") child.frame.height = height;
        if (typeof top === "number") child.frame.y = top;
        if (typeof left === "number") child.frame.x = left;
        // Do not implicitly center every child: only implement explicitly requested anchors.
        if (centerX !== undefined) child.frame.x = (centerX.frame.width - child.frame.width) / 2;
        child.layoutIfNeeded();
      }
    },
  };
  registry.set(definition.props.id, view);
  for (const child of definition.views ?? []) view.children.push(mount(child));
  return view;
}

test("welcome body centers, scrolls without overlap, and recovers after resize", () => {
  let bodyHeight = 200;
  const welcome = new WelcomeView({
    props: {
      pages: [
        {
          content: new ContentView({}),
          contentHeight: (width) => bodyHeight + (width < 300 ? 100 : 0),
          buttons: [
            { props: { title: "One" }, tapped: () => {} },
            { props: { title: "Two" }, tapped: () => {} },
          ],
        },
      ],
    },
    layout: $layout.fill,
  });
  const definition = welcome.definition;
  mount(definition);
  const scrollDefinition = definition.views[0].views[0].views[0].views[0].views[0];
  const scroll = registry.get(scrollDefinition.props.id);
  const canvasDefinition = scrollDefinition.views[0];
  const body = registry.get(canvasDefinition.views[0].props.id);
  const footer = registry.get(canvasDefinition.views[1].props.id);
  assert.equal(canvasDefinition.layout, undefined, "frame-managed scroll canvas must not opt into Auto Layout");
  assert.equal(typeof canvasDefinition.views[0].layout, "function");
  assert.equal(typeof canvasDefinition.views[1].layout, "function");
  // Execute the real initial constraint definitions, rather than supplying expected values.
  body.super = registry.get(canvasDefinition.props.id);
  footer.super = body.super;
  body.updateLayout(canvasDefinition.views[0].layout);
  footer.updateLayout(canvasDefinition.views[1].layout);
  assert.equal(body.constraints.centerX, undefined);
  assert.equal(footer.constraints.centerX, undefined);
  // A native layout pass controls these frames; direct frame writes must not be needed.
  for (const view of [body, footer]) {
    const frame = view.frame;
    Object.defineProperty(view, "frame", {
      get: () => frame,
      set: () => assert.fail("constrained child frame overwritten"),
    });
  }
  const resize = (width, height) => {
    scroll.frame = { width, height };
    scrollDefinition.events.layoutSubviews(scroll);
  };
  // Root ready must also recover when the scroll did not emit a post-mount layout event.
  scroll.frame = { width: 800, height: 900 };
  definition.events.ready();
  assert.equal(body.frame.width, 600);
  assert.equal(body.frame.x, 100);
  assert.equal(footer.frame.x, 100);
  assert.equal(scroll.contentSize.height, 900);
  assert.equal(body.frame.y - 16, footer.frame.y - 32 - body.frame.y - body.frame.height);
  resize(240, 180);
  assert.equal(body.frame.width, 192);
  assert.equal(body.frame.x, 24);
  assert.equal(footer.frame.x, 24);
  assert.ok(body.frame.x + body.frame.width <= 240);
  assert.equal(body.frame.y, 16);
  assert.ok(footer.frame.y >= body.frame.y + body.frame.height + 32);
  assert.equal(scroll.contentSize.height, footer.frame.y + footer.frame.height + 16);
  scroll.contentOffset.y = 290;
  resize(900, 800);
  assert.equal(scroll.contentOffset.y, 0);
  assert.equal(body.frame.x, 150);
  assert.equal(footer.frame.x + footer.frame.width, 750);
  // A portrait phone must have equal margins, with both controls inside the viewport.
  resize(393, 700);
  assert.equal(body.frame.x, 24);
  assert.equal(body.frame.x + body.frame.width, 369);
  assert.equal(footer.frame.x, body.frame.x);
  assert.equal(footer.frame.width, body.frame.width);
  bodyHeight = 1000;
  welcome.refreshLayout();
  assert.equal(body.frame.height, 1000);
  assert.ok(scroll.contentSize.height > 800);
  assert.throws(() => welcome.scrollToPage(1), RangeError);
});

test("per-page trailing actions follow initial page, programmatic navigation and swipes", () => {
  const calls = [];
  const makePage = (trailingAction) => ({
    content: new ContentView({}),
    contentHeight: 100,
    buttons: [{ props: { title: "Next" }, tapped: () => {} }],
    trailingAction,
  });
  const welcome = new WelcomeView({
    props: {
      page: 2,
      pages: [
        makePage({
          title: "跳过",
          titleColor: "blue",
          tapped: (view) => {
            calls.push("skip");
            view.scrollToPage(2);
          },
        }),
        makePage(),
        makePage({
          title: "完成",
          tapped: (view) => {
            assert.equal(view, welcome);
            calls.push("done");
          },
        }),
      ],
    },
    layout: $layout.fill,
  });
  const definition = welcome.definition;
  mount(definition);
  const buttonDefinition = definition.views[1].views[0];
  const button = registry.get(buttonDefinition.props.id);
  const tap = () => buttonDefinition.events.tapped(button);
  assert.equal(button.title, "完成");
  assert.equal(button.hidden, false);
  tap();
  assert.deepEqual(calls, ["done"]);
  welcome.page = 0;
  assert.equal(button.title, "跳过");
  assert.equal(button.titleColor, "blue");
  tap();
  assert.equal(welcome.page, 2);
  assert.equal(button.title, "完成");
  assert.equal(button.titleColor, "primaryText");
  welcome.page = 1;
  assert.equal(button.hidden, true);
  tap(); // A stale queued tap must not dispatch the previous page's action.
  assert.deepEqual(calls, ["done", "skip"]);
  const scroll = welcome.pageViewer.scroll.view;
  scroll.frame = { width: 393, height: 700 };
  const scrollEvents = welcome.pageViewer.scroll.definition.events;
  scrollEvents.layoutSubviews(scroll);
  scrollEvents.willEndDragging(scroll, {}, { x: 0, y: 0 });
  assert.equal(button.hidden, false);
  assert.equal(button.title, "跳过");
  scrollEvents.willEndDragging(scroll, {}, { x: 786, y: 0 });
  assert.equal(button.title, "完成");
  tap();
  assert.deepEqual(calls, ["done", "skip", "done"]);
});

test("full-screen page backgrounds slide beneath transparent header and page control", () => {
  const makePage = (bgcolor) => ({
    bgcolor,
    content: new ContentView({}),
    contentHeight: 100,
    buttons: [{ props: { title: "Next" }, tapped: () => {} }],
    trailingAction: { title: "Next", tapped: () => {} },
  });
  const welcome = new WelcomeView({
    props: { page: 1, bgcolor: "default", pages: [makePage("yellow"), makePage("blue"), makePage()] },
    layout: $layout.fill,
  });
  const definition = welcome.definition;
  const [pager, header, indicator] = definition.views;
  assert.equal(pager.props.id, welcome.pageViewer.id);
  assert.equal(pager.layout, $layout.fill, "pager must extend beneath both overlays and safe areas");
  assert.equal(header.props.bgcolor, "clear");
  assert.equal(indicator.props.id, welcome.pageControl.id);
  const backgrounds = pager.views[0].views.map((wrapper) => wrapper.views[0]);
  assert.deepEqual(
    backgrounds.map((page) => page.props.bgcolor),
    ["yellow", "blue", "default"],
  );
  for (const page of backgrounds) {
    assert.equal(page.layout, $layout.fill);
    const scroll = page.views[0];
    assert.equal(scroll.props.bgcolor, "clear");
    const constraints = {};
    const safeArea = {};
    const maker = new Proxy(
      {},
      {
        get: (_target, key) => {
          const keys = [key];
          const chain = new Proxy(
            {},
            {
              get: (_target, attribute) => {
                if (attribute === "equalTo")
                  return (target) => {
                    for (const name of keys) constraints[name] = { target, offset: 0 };
                    return chain;
                  };
                if (attribute === "offset")
                  return (offset) => {
                    for (const name of keys) constraints[name].offset = offset;
                    return chain;
                  };
                keys.push(attribute);
                return chain;
              },
            },
          );
          return chain;
        },
      },
    );
    scroll.layout(maker, { super: { safeArea } });
    assert.deepEqual(constraints, {
      left: { target: safeArea, offset: 0 },
      right: { target: safeArea, offset: 0 },
      top: { target: safeArea, offset: 50 },
      bottom: { target: safeArea, offset: -28 },
    });
  }
  mount(definition);
  const scroll = welcome.pageViewer.scroll.view;
  scroll.frame = { width: 393, height: 700 };
  const events = welcome.pageViewer.scroll.definition.events;
  events.layoutSubviews(scroll);
  // At a partial drag, both page backgrounds remain present across their entire page.
  scroll.contentOffset = { x: 196.5, y: 0 };
  events.didScroll(scroll);
  assert.equal(welcome.view.bgcolor, "default", "no discrete root recoloring during paging");
  assert.deepEqual(
    backgrounds.map((page) => registry.get(page.props.id).bgcolor),
    ["yellow", "blue", "default"],
  );
  welcome.page = 0;
  welcome.scrollToPage(2);
  assert.equal(welcome.view.bgcolor, "default");
  assert.equal(welcome.pageControl.currentPage, 2);
  const plain = new WelcomeView({ props: { pages: [makePage()] }, layout: $layout.fill });
  assert.equal(plain.definition.views[0].views[0].views[0].views[0].props.bgcolor, "backgroundColor");
});

test("logo gap expands within bounds, collapses before scrolling, and reacts to content changes", () => {
  let contentHeight = 200;
  const welcome = new WelcomeView({
    props: {
      pages: [
        {
          logo: { props: { symbol: "sparkles" }, size: 128 },
          content: new ContentView({}),
          contentHeight: () => contentHeight,
          buttons: [{ props: { title: "Continue" }, tapped: () => {} }],
        },
      ],
    },
    layout: $layout.fill,
  });
  const definition = welcome.definition;
  mount(definition);
  const scrollDefinition = definition.views[0].views[0].views[0].views[0].views[0];
  const scroll = registry.get(scrollDefinition.props.id);
  const canvasDefinition = scrollDefinition.views[0];
  const [body, footer, logo] = canvasDefinition.views.map((item) => registry.get(item.props.id));
  for (const child of canvasDefinition.views) registry.get(child.props.id).updateLayout(child.layout);
  const resize = (width, height) => {
    scroll.frame = { width, height };
    scrollDefinition.events.layoutSubviews(scroll);
  };
  const gap = () => body.frame.y - logo.frame.y - logo.frame.height;
  resize(393, 1000);
  assert.equal(gap(), 80);
  assert.equal(logo.frame.width, 128);
  assert.equal(logo.frame.x, (393 - 128) / 2);
  assert.equal(logo.frame.y - 16, footer.frame.y - 32 - body.frame.y - body.frame.height);
  assert.equal(scroll.contentSize.height, 1000);
  resize(393, 550);
  assert.equal(gap(), 52);
  assert.equal(scroll.contentSize.height, 550);
  resize(393, 466);
  assert.equal(gap(), 24);
  assert.equal(scroll.contentSize.height, 466);
  resize(393, 250);
  assert.equal(gap(), 24);
  assert.equal(logo.frame.y, 16);
  assert.equal(body.frame.height, 200);
  assert.equal(scroll.contentSize.height, 466);
  assert.equal(footer.frame.y - body.frame.y - body.frame.height, 32);
  resize(80, 550);
  assert.equal(logo.frame.width, 40);
  assert.equal(logo.frame.height, 40);
  assert.equal(logo.frame.x, 20);
  contentHeight = 800;
  welcome.refreshLayout();
  assert.equal(body.frame.height, 800);
  assert.equal(gap(), 24);
  assert.ok(scroll.contentSize.height > 550);
  scroll.contentOffset.y = 400;
  contentHeight = 100;
  welcome.refreshLayout();
  assert.equal(scroll.contentOffset.y, 0);
});

test("logo spacing supports custom limits and rejects invalid dimensions", () => {
  const make = (logo, logoSpacing) =>
    new WelcomeView({
      props: {
        pages: [
          {
            logo,
            logoSpacing,
            content: new ContentView({}),
            contentHeight: 100,
            buttons: [{ props: { title: "Continue" }, tapped: () => {} }],
          },
        ],
      },
      layout: $layout.fill,
    });
  for (const size of [0, -1, NaN, Infinity]) assert.throws(() => make({ props: {}, size }), /logo size or spacing/);
  for (const logoSpacing of [{ min: -1 }, { min: 90, max: 80 }, { max: Infinity }])
    assert.throws(() => make({ props: {} }, logoSpacing), /logo size or spacing/);
  const welcome = make({ props: {} }, { min: 40, max: 40 });
  const definition = welcome.definition;
  mount(definition);
  const scrollDefinition = definition.views[0].views[0].views[0].views[0].views[0];
  const scroll = registry.get(scrollDefinition.props.id);
  const children = scrollDefinition.views[0].views;
  for (const child of children) registry.get(child.props.id).updateLayout(child.layout);
  const [body, , logo] = children.map((child) => registry.get(child.props.id));
  for (const height of [250, 1000]) {
    scroll.frame = { width: 393, height };
    scrollDefinition.events.layoutSubviews(scroll);
    assert.equal(body.frame.y - logo.frame.y - logo.frame.height, 40);
  }
});

test("scrolling repairs reset canvas hit bounds without resetting the scroll position", () => {
  const welcome = new WelcomeView({
    props: {
      pages: [
        {
          content: new ContentView({}),
          contentHeight: 600,
          buttons: [{ props: { title: "Continue" }, tapped: () => {} }],
        },
      ],
    },
    layout: $layout.fill,
  });
  const definition = welcome.definition;
  mount(definition);
  const scrollDefinition = definition.views[0].views[0].views[0].views[0].views[0];
  const scroll = registry.get(scrollDefinition.props.id);
  const canvasDefinition = scrollDefinition.views[0];
  const canvas = registry.get(canvasDefinition.props.id);
  for (const child of canvasDefinition.views) registry.get(child.props.id).updateLayout(child.layout);
  scroll.frame = { width: 393, height: 250 };
  scrollDefinition.events.layoutSubviews(scroll);
  const expected = { ...canvas.frame };
  const body = registry.get(canvasDefinition.views[0].props.id);
  const footer = registry.get(canvasDefinition.views[1].props.id);
  const inCanvas = (point) =>
    point.x >= canvas.frame.x &&
    point.x < canvas.frame.x + canvas.frame.width &&
    point.y >= canvas.frame.y &&
    point.y < canvas.frame.y + canvas.frame.height;
  const footerPoint = { x: footer.frame.x + 20, y: footer.frame.y + 25 };
  scroll.contentOffset = { x: 0, y: footerPoint.y - 100 };
  for (const event of ["layoutSubviews", "didScroll"]) {
    canvas.frame = { x: 0, y: 0, width: 1, height: 1 };
    assert.equal(inCanvas(footerPoint), false);
    const offset = { ...scroll.contentOffset };
    scrollDefinition.events[event](scroll);
    assert.deepEqual(canvas.frame, expected);
    assert.deepEqual(scroll.contentOffset, offset);
    assert.ok(inCanvas(footerPoint));
    assert.ok(inCanvas({ x: body.frame.x + 20, y: body.frame.y + 400 }));
  }
});
