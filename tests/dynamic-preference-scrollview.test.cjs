const assert = require("node:assert/strict");
const test = require("node:test");
const registry = new Map();
let input;
let picker;
let menu;
const delays = [];
const animations = [];
Object.assign(globalThis, {
  $delay: (seconds, handler) => delays.push({ seconds, handler }),
  $: (id) => registry.get(id),
  $color: (name) => name,
  $font: (size) => size,
  $size: (width, height) => ({ width, height }),
  $rect: (x, y, width, height) => ({ x, y, width, height }),
  $indexPath: (section, row) => ({ section, row }),
  $align: { right: 2, center: 1 },
  $layout: { fill() {} },
  $device: { info: { screen: { scale: 3 } } },
  $text: { sizeThatFits: ({ text, width }) => ({ height: Math.ceil((text.length * 7) / width) * 16 }) },
  $kbType: { default: 0, decimal: 1, number: 2 },
  $input: {
    text: (options) => {
      input = options;
    },
  },
  $picker: {
    date: (options) => {
      picker = options;
    },
  },
  $ui: {
    animate: (options) => {
      animations.push(options);
      options.animation();
    },
    menu: (options) => {
      menu = options;
    },
    alert() {},
  },
});
const { DynamicPreferenceScrollView } = require("../dist/components/dynamic-preference-scrollview");

function mount(definition, parent) {
  const view = {
    ...definition.props,
    definition,
    super: parent,
    views: [],
    frame: { x: 0, y: 0, width: 375, height: 600 },
    ocValue() {
      const bridge = {
        invoke: (name) => {
          if (name === "removeAllAnimations") this.cancelledAnimations = (this.cancelledAnimations || 0) + 1;
          return bridge;
        },
      };
      return bridge;
    },
    get(id) {
      return registry.get(id);
    },
    add(child) {
      const node = mount(child, this);
      node.prev = this.views.at(-1);
      if (node.prev) node.prev.next = node;
      this.views.push(node);
    },
    remove() {
      this.views.slice().forEach((child) => child.remove());
      registry.delete(this.id);
      if (this.super) this.super.views = this.super.views.filter((child) => child !== this);
    },
  };
  if (view.id) registry.set(view.id, view);
  definition.views?.forEach((child) => view.add(child));
  return view;
}
function load(component) {
  const root = mount(component.definition);
  root.definition.events.ready(root);
  return root;
}
function flatten(view) {
  return [view, ...view.views.flatMap(flatten)];
}
function control(root, type) {
  return flatten(root).find((view) => view.definition.type === type);
}
function tapRow(root, index = 0) {
  flatten(root)
    .filter((view) => view.definition.events?.tapped && view.definition.type === "view")
    [index].definition.events.tapped();
}

test("scroll renders ordinary views, wraps footers, isolates IDs and relayouts once per width", () => {
  let tapped = 0;
  const section = {
    title: "Settings",
    footer: { text: "长说明".repeat(50), color: "custom", tapped: () => tapped++ },
    rows: [{ type: "boolean", key: "on" }],
  };
  const component = new DynamicPreferenceScrollView({ sections: [section] });
  const root = load(component);
  assert.equal(
    flatten(root).some((view) => view.definition.type === "list"),
    false,
  );
  assert.equal(component.values.on, false);
  const footer = flatten(root).find((view) => view.text === section.footer.text);
  assert.equal(footer.lines, 0);
  assert.equal(footer.textColor, "custom");
  footer.definition.events.tapped();
  assert.equal(tapped, 1);
  const height = root.contentSize.height;
  const content = root.views[0];
  const card = content.views[1];
  root.definition.events.layoutSubviews(root);
  assert.equal(content.views[1], card);
  root.frame.width = 240;
  root.definition.events.layoutSubviews(root);
  assert.ok(root.contentSize.height > height);
  assert.equal(content.frame.width, 240);
  const second = load(new DynamicPreferenceScrollView({ sections: [section] }));
  assert.notEqual(control(root, "switch").id, control(second, "switch").id);
  assert.equal(section.rows[0].value, undefined);
});

test("slider preview/commit and programmatic changes preserve controls and scroll offset", () => {
  const changes = [];
  const component = new DynamicPreferenceScrollView({
    sections: [
      {
        rows: [
          { type: "slider", key: "slider", min: 10, max: 20, decimal: 1 },
          { type: "stepper", key: "step", min: -5 },
          { type: "boolean", key: "enabled" },
          { type: "tab", key: "tab", items: ["A", "B"] },
          { type: "info", key: "ignored", value: "Info" },
        ],
      },
    ],
    events: { changed: (values) => changes.push(values) },
  });
  const root = load(component);
  root.contentOffset = { x: 0, y: 30 };
  const slider = control(root, "slider");
  assert.equal(slider.value, 0);
  slider.value = 0.45;
  slider.definition.events.changed(slider);
  assert.equal(slider.next.text, "14.5");
  assert.equal(component.values.slider, 10);
  slider.definition.events.touchesEnded(slider);
  assert.equal(component.values.slider, 14.5);
  assert.equal(changes.length, 1);
  assert.equal(control(root, "slider"), slider);
  component.set("slider", 20);
  assert.equal(slider.value, 1);
  assert.equal(changes.length, 1);
  for (const [type, prop, value] of [
    ["stepper", "value", -2],
    ["switch", "on", true],
    ["tab", "index", 1],
  ]) {
    const sender = control(root, type);
    sender[prop] = value;
    sender.definition.events.changed(sender);
  }
  assert.deepEqual(component.values, { slider: 20, step: -2, enabled: true, tab: 1 });
  assert.deepEqual(root.contentOffset, { x: 0, y: 30 });
});

test("sections work before mount and replacement invalidates pending input", () => {
  let changed = 0;
  const component = new DynamicPreferenceScrollView({ sections: [], events: { changed: () => changed++ } });
  component.sections = [{ rows: [{ type: "string", key: "name", value: "old" }] }];
  component.set("name", "before mount");
  const root = load(component);
  tapRow(root);
  assert.equal(input.text, "before mount");
  const pending = input;
  component.sections = [{ footer: { text: "New footer" }, rows: [{ type: "string", key: "name", value: "new" }] }];
  pending.handler("stale");
  assert.equal(component.values.name, "new");
  assert.equal(changed, 0);
  tapRow(root);
  input.handler("edited");
  assert.equal(component.values.name, "edited");
  assert.equal(changed, 1);
  component.sections = [];
  assert.equal(root.contentSize.height, 0);
  assert.equal(root.views[0].views.length, 0);
});

test("numeric input limits, secure masking, list and date pickers match dynamic list", () => {
  const component = new DynamicPreferenceScrollView({
    sections: [
      {
        rows: [
          { type: "number", key: "num", min: 1, max: 5 },
          { type: "secure", key: "secret", value: "secret" },
          { type: "list", key: "choice", items: ["A", "B"] },
          { type: "date", key: "date", mode: 0 },
        ],
      },
    ],
  });
  const root = load(component);
  tapRow(root, 0);
  input.handler("invalid");
  assert.equal(component.values.num, undefined);
  input.handler("99");
  assert.equal(component.values.num, 5);
  tapRow(root, 1);
  assert.equal(input.text, "");
  input.handler("new secret");
  assert.ok(flatten(root).some((view) => view.text === "******"));
  tapRow(root, 2);
  menu.handler("B", 1);
  assert.equal(component.values.choice, 1);
  tapRow(root, 3);
  assert.equal(picker.props.mode, 0);
  const date = new Date(2026, 0, 1, 12, 30);
  picker.handler(date);
  assert.equal(component.values.date, date);
});

test("heightToWidth measures unmounted content without laying out and matches rendered height", () => {
  const component = new DynamicPreferenceScrollView({
    props: { scrollEnabled: false, rowHeight: 50 },
    sections: [
      { title: "Title", rows: [{ type: "boolean" }, { type: "string" }], footer: { text: "说明".repeat(80) } },
      { rows: [{ type: "action" }] },
    ],
  });
  const count = registry.size;
  const height = component.heightToWidth(375);
  assert.equal(registry.size, count);
  assert.ok(component.heightToWidth(200) > height);
  const root = load(component);
  assert.equal(root.contentSize.height, height);
  const card = root.views[0].views[1];
  const frame = { ...root.views[0].frame };
  component.heightToWidth(200);
  assert.equal(root.views[0].views[1], card);
  assert.deepEqual(root.views[0].frame, frame);
  assert.equal(root.contentSize.height, height);
  component.sections = [];
  assert.equal(component.heightToWidth(375), 0);
});

test("heightToWidth returns frame height when scrolling is enabled, including runtime changes", () => {
  const component = new DynamicPreferenceScrollView({ sections: [{ rows: [{ type: "boolean" }] }] });
  const root = load(component);
  root.frame.height = 123;
  assert.equal(component.heightToWidth(200), 123);
  assert.equal(component.heightToWidth(500), 123);
  root.scrollEnabled = false;
  assert.equal(component.heightToWidth(375), 84);
  root.scrollEnabled = true;
  assert.equal(component.heightToWidth(375), 123);
});

function highlightFixture() {
  delays.length = 0;
  animations.length = 0;
  let selected = 0;
  const component = new DynamicPreferenceScrollView({
    sections: [{ rows: [{ type: "action", value: () => selected++ }] }],
  });
  const root = load(component);
  const row = flatten(root).find((view) => view.definition.type === "view" && view.definition.events?.tapped);
  const highlight = row.views[0];
  return { component, root, row, highlight, events: row.definition.events, selected: () => selected };
}

function flushDelays() {
  delays.splice(0).forEach((item) => item.handler());
}

test("quick taps always paint a highlight before a half-second fade and dispatch immediately", () => {
  const fixture = highlightFixture();
  const { events, highlight } = fixture;
  assert.equal(highlight.userInteractionEnabled, false);
  assert.equal(highlight.alpha, 0);
  // tapped alone also works when a scroll view delays initial touch delivery.
  events.tapped();
  assert.equal(fixture.selected(), 1);
  assert.equal(highlight.alpha, 1);
  assert.equal(animations.length, 0);
  assert.equal(delays[0].seconds, 1 / 60);
  events.touchesEnded?.();
  events.touchesCancelled?.(); // gesture recognition must not erase a confirmed tap
  assert.equal(highlight.alpha, 1);
  flushDelays();
  assert.equal(animations.length, 1);
  assert.equal(animations[0].duration, 0.5);
  assert.equal(animations[0].options, 2);
  assert.equal(highlight.alpha, 0);
});

test("hold stays gray and release then tapped share one fade without resetting opacity", () => {
  const { events, highlight, selected } = highlightFixture();
  events.touchesBegan();
  flushDelays();
  assert.equal(highlight.alpha, 1);
  assert.equal(animations.length, 0);
  events.touchesEnded();
  assert.equal(highlight.alpha, 1);
  flushDelays(); // animation may start before the tapped callback arrives
  assert.equal(animations.length, 1);
  assert.equal(highlight.alpha, 0);
  events.tapped();
  assert.equal(highlight.alpha, 0); // never reset to gray at release
  assert.equal(highlight.cancelledAnimations, 1);
  flushDelays();
  assert.equal(animations.length, 1);
  assert.equal(selected(), 1);
});

test("tapped before release also fades once, and a new press cancels the pending fade", () => {
  const { events, highlight } = highlightFixture();
  events.touchesBegan();
  events.tapped();
  events.touchesEnded();
  flushDelays();
  assert.equal(animations.length, 1);
  assert.equal(highlight.cancelledAnimations, 1);
  events.touchesBegan();
  events.touchesEnded();
  events.touchesBegan();
  flushDelays();
  assert.equal(highlight.alpha, 1);
  assert.equal(animations.length, 1);
});

test("cancelled touches clear without a fade unless a tap is confirmed", () => {
  const { events, highlight, selected } = highlightFixture();
  events.touchesBegan();
  events.touchesCancelled();
  flushDelays();
  assert.equal(highlight.alpha, 0);
  assert.equal(animations.length, 0);
  assert.equal(selected(), 0);
  events.touchesBegan();
  events.touchesCancelled();
  events.tapped();
  assert.equal(highlight.alpha, 1);
  assert.equal(highlight.cancelledAnimations, 3);
  flushDelays();
  assert.equal(animations.length, 1);
  assert.equal(selected(), 1);
});

test("repeated taps restart the fade and old callbacks cannot animate replacement rows", () => {
  const { events, highlight, component, root } = highlightFixture();
  events.tapped();
  flushDelays();
  events.tapped();
  events.tapped();
  flushDelays();
  assert.equal(animations.length, 2); // only the latest pending tap starts a fade
  assert.equal(highlight.cancelledAnimations, 3);
  events.tapped();
  root.frame.width = 250;
  root.definition.events.layoutSubviews(root);
  flushDelays();
  assert.equal(animations.length, 2);
  const newEvents = flatten(root).find((view) => view.definition.type === "view" && view.definition.events?.tapped)
    .definition.events;
  newEvents.tapped();
  component.sections = [];
  flushDelays();
  assert.equal(animations.length, 2);
});
