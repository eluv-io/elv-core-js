import {createTheme, rem, Button, PasswordInput, TextInput, Select, NumberInput, Modal, Textarea, Paper} from "@mantine/core";

import SharedStyles from "./stylesheets/modules/shared.module.scss";

// 10-step brand scale, index 6 is the primary.
// Replaces Mantine's default blue, which was 3.56:1 on white and failed AA as
// link and active-nav text. Index 6 (#6c5ce0) is 4.95:1.
// Keep in sync with --accent / --accent-hover / --accent-soft.
const brand = [
  "#f2f0fe",
  "#e4e0fc",
  "#c9c2f8",
  "#ada2f3",
  "#8b7bff",
  "#7e6de7",
  "#6c5ce0",
  "#5a4bc8",
  "#4a3da8",
  "#3b3089"
];

// Destructive actions. Mantine's built-in `red` does not track the --error
// token, so the Remove Passkey button would drift from every other error
// surface once the dark scheme is in play. Index 6 is --error (light), index 4
// is --error (dark); Mantine picks by scheme via primaryShade-style resolution.
const danger = [
  "#fdf2f3",
  "#f9dade",
  "#f3b6bd",
  "#ef8f9a",
  "#f2707a",
  "#dc4b58",
  "#c6303b",
  "#a52530",
  "#851d27",
  "#65151d"
];

const MantineTheme = createTheme({
  /** Put your mantine theme override here */
  primaryColor: "brand",

  // Light uses shade 6, dark lifts to 4 — #6c5ce0 is too dim on a dark ground
  // and #8b7bff is too pale on a light one. Mirrors --accent in both schemes.
  primaryShade: {light: 6, dark: 4},
  colors: {brand, danger},

  fontFamily: "Inter, \"Helvetica Neue\", helvetica, sans-serif",
  fontFamilyMonospace: "\"JetBrains Mono\", ui-monospace, SFMono-Regular, Menlo, monospace",

  // Six steps. Previously xs/sm/md/lg/xl were 12/14/16/18/20 — 18 sat between
  // two steps of the scale and has been folded away.
  fontSizes: {
    xs: rem(12),
    sm: rem(14),
    md: rem(16),
    lg: rem(20),
    xl: rem(24)
  },

  lineHeights: {
    xs: "1.25",
    sm: "1.35",
    md: "1.5",
    lg: "1.5",
    xl: "1.5"
  },

  headings: {
    fontWeight: "600",
    sizes: {
      h1: {fontSize: rem(32), lineHeight: "1.25"},
      h2: {fontSize: rem(24), lineHeight: "1.25"},
      h3: {fontSize: rem(20), lineHeight: "1.3"},
      h4: {fontSize: rem(16), lineHeight: "1.4"},
      h5: {fontSize: rem(14), lineHeight: "1.4"},
      h6: {fontSize: rem(12), lineHeight: "1.4"}
    }
  },

  // Mirrors --r-control / --r-card / --r-container.
  radius: {
    xs: rem(6),
    sm: rem(8),
    md: rem(10),
    lg: rem(14),
    xl: rem(18)
  },
  defaultRadius: "sm",

  // Mirrors --shadow-1 / --shadow-2.
  shadows: {
    xs: "0 1px 2px rgba(22, 24, 31, 0.05)",
    sm: "0 1px 2px rgba(22, 24, 31, 0.05), 0 4px 10px -3px rgba(22, 24, 31, 0.06)",
    md: "0 2px 4px rgba(22, 24, 31, 0.04), 0 10px 22px -6px rgba(22, 24, 31, 0.1)",
    lg: "0 4px 8px rgba(22, 24, 31, 0.04), 0 16px 32px -8px rgba(22, 24, 31, 0.12)",
    xl: "0 8px 16px rgba(22, 24, 31, 0.06), 0 24px 48px -12px rgba(22, 24, 31, 0.16)"
  },

  focusRing: "auto",

  components: {
    Button: Button.extend({
      styles: {
        root: {
          transition: "background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease",
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
    Textarea: Textarea.extend({
      defaultProps: {
        classNames: {
          input: SharedStyles["textarea"]
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
          input: `${SharedStyles["input"]} ${SharedStyles["input--select"]}`
        }
      }
    }),
    // `withBorder` otherwise uses Mantine's own default border and surface,
    // which flip with the scheme but do not match --line / --bg-surface. Four
    // call sites, all card-shaped.
    Paper: Paper.extend({
      defaultProps: {
        classNames: {
          root: SharedStyles["paper"]
        }
      }
    }),
    Modal: Modal.extend({
      defaultProps: {
        radius: "lg",
        classNames: {
          header: SharedStyles["modal__header"],
          overlay: SharedStyles["modal__overlay"]
        }
      }
    })
  }
});

export default MantineTheme;
