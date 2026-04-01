import { DialogSheet } from "../components/dialogs/dialog-sheet";
import { ContentView } from "../components/single-views";

const cview = new ContentView({
  props: {
    bgcolor: $color("lightGray"),
  },
  layout: $layout.fill,
});

$ui.render({
  views: [
    {
      type: "button",
      props: {
        title: "Show Dialog Sheet",
      },
      layout: $layout.center,
      events: {
        tapped: async () => {
          const sheet = new DialogSheet({
            title: "Dialog Sheet",
            cview,
            doneHandler: () => {
              $ui.alert("Done");
            },
            presentMode: 1,
            bgcolor: $color("white"),
            doneButtonHidden: false,
            doneButtonValidator: () => {
              return true;
            },
            doneButtonTitle: "完成",
          });
          await sheet.present();
        },
      },
    },
  ],
});
