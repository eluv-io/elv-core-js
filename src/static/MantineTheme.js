import {createTheme, em, Button, PasswordInput, TextInput, Select, NumberInput} from "@mantine/core";

import SharedStyles from "./stylesheets/modules/shared.module.scss";

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
    }),
    PasswordInput: PasswordInput.extend({
      defaultProps: {
        classNames: {
          root: SharedStyles["input-container"],
          wrapper: SharedStyles["input-wrapper"],
          input: SharedStyles["input"],
          innerInput: SharedStyles["inner-input"],
          visibilityToggle: SharedStyles["input-visibility-toggle"]
        }
      }
    }),
    TextInput: TextInput.extend({
      defaultProps: {
        classNames: {
          input: SharedStyles["input"]
        }
      }
    }),
    NumberInput: NumberInput.extend({
      defaultProps: {
        classNames: {
          input: SharedStyles["input"]
        }
      }
    }),
    Select: Select.extend({
      defaultProps: {
        classNames: {
          input: SharedStyles["input"]
        }
      }
    })
  }
});

export default MantineTheme;
