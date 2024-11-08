import {createTheme, em, Button} from "@mantine/core";

const MantineTheme = createTheme({
  /** Put your mantine theme override here */
  fontSizes: {
    xs: em(12),
    sm: em(14),
    md: em(16),
    lg: em(18),
    xl: em(20)
  },
  components: {
    Button: Button.extend({
      styles: {
        root: {
          ":active": {
            transform: "none",
            transitionDuration: 0
          },
          transitionDuration: 0,
        },
        loader: {
          transitionDuration: 0,
          transform: "none!important",
          ":active": {
            transform: "none!important",
            transitionDuration: 0,
          }
        }
      }
    })
  }
});

export default MantineTheme;
