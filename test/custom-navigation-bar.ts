import { CustomNavigationBar } from "../components/custom-navigation-bar"

const navbar = new CustomNavigationBar({
  props: {
    title: "Custom Navigation Bar",
    popButtonEnabled: true,
    popButtonTitle: "Back",
  }
})

$ui.render({
  views: [{
    type: "button",
    props: {
      
    },
    layout: $layout.fill,
    events: {
      tapped: () => {
        $ui.push({
          views: [navbar.definition]
        })
      }
    }
  }]
})