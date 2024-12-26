import { RefreshButton } from "../components/refresh-button";

const refreshButton = new RefreshButton({
  props: {
    tintColor: $color("primaryText"),
    enabled: true,
    hidden: false
  },
  layout: (make, view) => {
    make.width.equalTo(50);
    make.height.equalTo(50);
    make.top.inset(100);
    make.centerX.equalTo(view.super);
  },
  events: {
    tapped: async () => {
      refreshButton.loading = true;
      await $wait(2);
      refreshButton.loading = false;
    }
  }
});

$ui.render({
  views: [refreshButton.definition]
});