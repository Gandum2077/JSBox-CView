"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const viewRegistry = new Map();
const uiErrors = [];
let pickerOptions;

const color = () => ({
  components: { red: 0, green: 0, blue: 0, alpha: 1 },
  ocValue: () => ({ invoke: () => undefined }),
});

Object.assign(globalThis, {
  $: (id) => viewRegistry.get(id),
  $align: { center: 1, left: 0, right: 2 },
  $clipboard: { text: "" },
  $color: color,
  $contentMode: { scaleAspectFit: 1 },
  $define: () => undefined,
  $delay: () => undefined,
  $device: { info: { language: "en" }, isIpad: false },
  $font: (...args) => ({ args }),
  $insets: (top, left, bottom, right) => ({ top, left, bottom, right }),
  $input: { text: () => undefined },
  $kbType: { decimal: 2, default: 0, number: 1 },
  $layout: {
    center: () => undefined,
    fill: () => undefined,
    fillSafeArea: () => undefined,
  },
  $l10n: (key) => key,
  $objc: () => ({ invoke: () => undefined }),
  $picker: { date: (options) => (pickerOptions = options) },
  $point: (x, y) => ({ x, y }),
  $range: (location, length) => ({ location, length }),
  $rect: (x, y, width, height) => ({ x, y, width, height }),
  $safari: { open: () => undefined },
  $size: (width, height) => ({ width, height }),
  $text: {
    sizeThatFits: ({ text }) => ({ width: String(text ?? "").length * 8, height: 20 }),
  },
  $ui: {
    alert: () => undefined,
    animate: ({ animation, completion }) => {
      animation?.();
      completion?.();
    },
    error: (message) => uiErrors.push(message),
    pop: () => undefined,
    popToRoot: () => undefined,
  },
});

function materialize(definition) {
  if (!definition || typeof definition !== "object") return;

  const id = definition.props?.id;
  if (id) {
    viewRegistry.set(id, {
      ...definition.props,
      add: () => undefined,
      bounds: { x: 0, y: 0, width: 320, height: 640 },
      frame: { x: 0, y: 0, width: 320, height: 640 },
      get: (childId) => viewRegistry.get(childId),
      reload: () => undefined,
      relayout: () => undefined,
      remakeLayout: () => undefined,
      updateLayout: () => undefined,
    });
  }

  definition.views?.forEach(materialize);
}

const { DynamicPreferenceListView } = require("../dist/components/dynamic-preference-listview");
const { PreferenceListView, dateToString } = require("../dist/components/static-preference-listview");

test("PreferenceListView preserves zero values and supplies documented defaults", () => {
  const preferences = new PreferenceListView({
    sections: [
      {
        title: "Regression",
        rows: [
          { type: "stepper", key: "stepper", min: -5, max: 5, value: 0 },
          { type: "slider", key: "slider", min: 10, max: 20 },
          { type: "boolean", key: "enabled" },
          { type: "tab", key: "tab", items: ["A", "B"] },
        ],
      },
    ],
  });

  const rows = preferences.definition.props.data[0].rows;
  assert.equal(rows[0].views[1].views[0].props.value, 0);
  assert.equal(rows[0].views[1].views[1].props.text, "0");
  assert.equal(rows[1].views[1].views[0].props.text, "10.0");
  assert.equal(rows[1].views[1].views[1].props.value, 10);
  assert.deepEqual(preferences.values, {
    stepper: 0,
    slider: 10,
    enabled: false,
    tab: -1,
  });
});

test("date mode 0 remains a time-only mode", () => {
  const date = new Date(2020, 0, 2, 3, 4);
  assert.equal(dateToString(0, date), "03:04");

  const preferences = new DynamicPreferenceListView({
    props: {},
    sections: [
      {
        title: "Date",
        rows: [{ type: "date", key: "date", value: date, mode: 0 }],
      },
    ],
  });

  const definition = preferences.definition;
  assert.equal(definition.props.data[0].rows[0].label_before_chevron.text, "03:04");

  pickerOptions = undefined;
  definition.events.didSelect({ data: definition.props.data }, { section: 0, row: 0 });
  assert.equal(pickerOptions.props.mode, 0);
});

test("DynamicPreferenceListView maps non-zero slider ranges to 0...1", () => {
  const preferences = new DynamicPreferenceListView({
    props: {},
    sections: [
      {
        title: "Regression",
        rows: [
          { type: "slider", key: "slider", min: 10, max: 20 },
          { type: "list", key: "list", items: ["A", "B"] },
          { type: "stepper", key: "stepper", min: -5 },
          { type: "boolean", key: "enabled" },
          { type: "tab", key: "tab", items: ["A", "B"] },
        ],
      },
    ],
  });

  const definition = preferences.definition;
  const rows = definition.props.data[0].rows;
  assert.equal(rows[0].slider.value, 0);
  assert.equal(rows[0].label_slider.text, 10);
  assert.equal(rows[1].label_before_chevron.text, "");
  assert.deepEqual(preferences.values, {
    slider: 10,
    list: undefined,
    stepper: -5,
    enabled: false,
    tab: -1,
  });

  materialize(definition);
  preferences.set("slider", 20);
  assert.equal(preferences.view.data[0].rows[0].slider.value, 1);
  assert.equal(preferences.view.data[0].rows[0].label_slider.text, 20);
});

test("PageViewer ignores scroll callbacks until its viewport has a width", () => {
  const { PageViewer } = require("../dist/components/pageviewer");
  let floatedPage;
  const page = { definition: { type: "view", props: {} } };
  const viewer = new PageViewer({
    props: { cviews: [page] },
    layout: globalThis.$layout.fill,
    events: { floatPageChanged: (_sender, value) => (floatedPage = value) },
  });
  const scrollEvents = viewer.definition.views[0].events;

  scrollEvents.didScroll({ contentOffset: { x: 10 } });
  assert.equal(floatedPage, undefined);

  const sender = { frame: { width: 320 }, contentOffset: { x: 0 }, contentSize: undefined };
  scrollEvents.layoutSubviews(sender);
  scrollEvents.didScroll(sender);
  assert.equal(floatedPage, 0);
});

test("listDialog requires a single selection but permits an empty multi-selection", () => {
  const { DialogSheet } = require("../dist/components/dialogs/dialog-sheet");
  const { listDialog } = require("../dist/components/dialogs/list-dialog");
  const originalPresent = DialogSheet.prototype.present;
  let sheet;

  DialogSheet.prototype.present = function presentForTest() {
    sheet = this;
    materialize(this._props.cview.definition);
  };

  try {
    uiErrors.length = 0;
    void listDialog({ items: ["A", "B"], title: "Single" });
    assert.equal(sheet._props.doneButtonValidator(), false);
    assert.deepEqual(uiErrors, ["NO_SELECTION"]);

    sheet._props.cview.view.data[1].image.hidden = false;
    assert.equal(sheet._props.doneButtonValidator(), true);
    assert.equal(sheet._props.doneHandler(), 1);

    void listDialog({ items: ["A", "B"], title: "Multiple", multiSelectEnabled: true });
    assert.equal(sheet._props.doneButtonValidator(), true);
    assert.deepEqual(sheet._props.doneHandler(), []);
  } finally {
    DialogSheet.prototype.present = originalPresent;
  }
});

test("CustomNavigationBar hides its tool area after restoring normal state", () => {
  const { ContentView } = require("../dist/components/single-views");
  const { CustomNavigationBar, NavBarState } = require("../dist/components/custom-navigation-bar");
  const navigationBar = new CustomNavigationBar({
    props: {
      style: NavBarState.Normal,
      title: "Title",
      toolView: new ContentView({ props: {} }),
    },
  });

  materialize(navigationBar.definition);
  navigationBar.setStyle(NavBarState.Expanded, false);
  assert.equal(navigationBar.cviews.toolViewWrapper.view.hidden, false);

  navigationBar.setStyle(NavBarState.Normal, false);
  assert.equal(navigationBar.style, NavBarState.Normal);
  assert.equal(navigationBar.cviews.toolViewWrapper.view.hidden, true);
});
