import { BaseController, EnhancedImageView } from "../../index";

const imageView = new EnhancedImageView({
  props: {
    src: "https://picsum.photos/seed/cview-enhanced/1200/1600",
    maxZoomScale: 4,
  },
  layout: $layout.fill,
  events: {
    relativeLocationTapped: (_sender, location) => {
      $ui.toast(`点击位置：${location.x.toFixed(2)}, ${location.y.toFixed(2)}`);
    },
  },
});

const controller = new BaseController({
  props: { bgcolor: $color("black") },
  events: {
    didRemove: () => imageView.releaseGestureObject(),
  },
});

controller.rootView.views = [imageView];
controller.uirender({ title: "Enhanced Image View" });
