const assert = require("node:assert/strict");
const test = require("node:test");
const classes = new Map();
const retained = new Set();
Object.assign(globalThis, {
  $indexPath: (section, row) => ({ section, row, item: row }),
  $defc: () => assert.fail("must not bridge selectors through C"),
  $define: ({ type, events }) => {
    assert.ok(type.endsWith("<UIContextMenuInteractionDelegate>"));
    assert.equal(events["respondsToSelector:"], undefined);
    assert.equal(events["forwardingTargetForSelector:"], undefined);
    classes.set(type.split(":")[0], events);
  },
  $objc_retain: (object) => retained.add(object),
  $objc_release: (object) => {
    assert.ok(retained.delete(object), "release must balance retain");
  },
  $block: (_signature, callback) => callback,
  $objc: (name) => ({
    $class: () => name,
    invoke: (method) => {
      assert.equal(method, "alloc");
      return {
        invoke: (initializer, value) => {
          if (name === "UITargetedPreview") {
            assert.equal(initializer, "initWithView");
            return { cell: value };
          }
          assert.equal(initializer, "initWithDelegate");
          return { events: value.events, $view: () => value.native };
        },
      };
    },
    $new: () => {
      const proxy = { events: classes.get(name), $isEqual: (other) => other === proxy };
      return proxy;
    },
    $systemImageNamed: (name) => name,
    $configurationWithIdentifier_previewProvider_actionProvider: (id, _preview, provider) => ({
      provider,
      $identifier: () => id,
    }),
    $menuWithTitle_children: (title, items) => ({ title, items }),
    $menuWithTitle_image_identifier_options_children: (title, image, _id, options, items) => ({
      title,
      image,
      options,
      items,
    }),
    $actionWithTitle_image_identifier_handler: (title, image, _id, handler) => {
      const action = { title, image, handler, $setAttributes: (value) => (action.attributes = value) };
      return action;
    },
  }),
});
const {
  DynamicContextMenuList,
  DynamicContextMenuMatrix,
} = require("../dist/components/dynamic-contextmenu-collection");

for (const [kind, Component] of [
  ["list", DynamicContextMenuList],
  ["matrix", DynamicContextMenuMatrix],
]) {
  const selector = "contextMenuInteraction:configurationForMenuAtLocation:";
  test(`${kind}: current data, hit testing, original delegates untouched, previews and lifecycle`, () => {
    let favorite = false;
    let currentData = { id: "first" };
    let seenData;
    let callbackCount = 0;
    let interaction;
    let path = { $section: () => 2, $row: () => 3 };
    const point = { x: 12, y: 130 };
    const cell = { $window: () => ({}) };
    const native = {
      $isKindOfClass: () => true,
      $delegate: () => assert.fail("must not read original delegate"),
      $setDelegate: () => assert.fail("must not replace original delegate"),
      $addInteraction: (value) => {
        interaction = value;
        value.$view = () => native;
      },
      $removeInteraction: (value) => {
        assert.equal(value, interaction);
        interaction = undefined;
      },
      [kind === "list" ? "$indexPathForRowAtPoint" : "$indexPathForItemAtPoint"]: (value) => {
        assert.equal(value, point);
        return path;
      },
      [kind === "list" ? "$cellForRowAtIndexPath" : "$cellForItemAtIndexPath"]: (value) => {
        assert.equal(value, path);
        return cell;
      },
    };
    const sender = {
      ocValue: () => native,
      object: (path) => {
        assert.deepEqual(path, { section: 2, row: 3, item: 3 });
        return currentData;
      },
    };
    const layout = () => {};
    const didSelect = () => {};
    const component = new Component({
      props: { data: [], reorder: true },
      layout,
      events: {
        didSelect,
        ready: () => assert.ok(interaction),
        ContextMenu: (view, path, data) => {
          callbackCount++;
          assert.equal(view, sender);
          seenData = data;
          return (
            data && {
              items: [
                {
                  title: "group",
                  inline: true,
                  destructive: true,
                  items: [
                    {
                      title: favorite ? "取消收藏" : "收藏",
                      symbol: "star",
                      destructive: favorite,
                      handler: (actualView, actualPath) => {
                        assert.equal(actualView, sender);
                        assert.deepEqual(actualPath, path);
                        favorite = !favorite;
                      },
                    },
                  ],
                  handler: () => assert.fail("submenu handler must be ignored"),
                },
              ],
            }
          );
        },
      },
    });
    const definition = component.definition;
    assert.equal(definition.type, kind);
    assert.equal(definition.layout, layout);
    assert.equal(definition.events.didSelect, didSelect);
    assert.equal(definition.props.reorder, true);
    assert.equal(definition.events.ContextMenu, undefined);
    definition.events.ready(sender);
    const events = interaction.events;
    const currentInteraction = interaction;
    const request = () => events[selector](currentInteraction, point);
    const config = request();
    assert.equal(
      events["contextMenuInteraction:previewForHighlightingMenuWithConfiguration:"](interaction, config).cell,
      cell,
    );
    callbackCount = 0;
    const group = request().provider().items[0];
    assert.equal(group.options, 3);
    assert.equal(group.items[0].title, "收藏");
    group.items[0].handler();
    currentData = { id: "replacement" };
    const action = request().provider().items[0].items[0];
    assert.equal(action.title, "取消收藏");
    assert.equal(action.attributes, 2);
    assert.equal(seenData, currentData);
    assert.equal(callbackCount, 2);
    currentData = null;
    assert.equal(request(), null);
    path = null;
    const previousCount = callbackCount;
    assert.equal(request(), null);
    assert.equal(callbackCount, previousCount, "empty space must not generate a menu");
    component.dispose();
    component.dispose();
    assert.equal(interaction, undefined);
    assert.equal(request(), null);
    assert.equal(retained.size, 0);
    definition.events.ready(sender);
    component.dispose();
    assert.equal(interaction, undefined);
    assert.equal(retained.size, 0);
  });
}
