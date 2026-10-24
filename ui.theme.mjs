/**
 * Nuxt UIのテーマ設定（app config相当）。
 *
 * 画面の見た目は従来のデザイン（Material Design基調）を維持するため、
 * ボタンやモーダルの高さ・角丸・文字設定・影をここで一括して上書きする。
 * 色の実値は `src/assets/styles/main.css` のCSS変数で指定する。
 */

/** Material Designのelevation 2相当の影 */
const ELEVATION_2 =
  "shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),0_2px_2px_0_rgba(0,0,0,0.14),0_1px_5px_0_rgba(0,0,0,0.12)]";

/** Material Designのelevation 24相当の影（ダイアログ用） */
const ELEVATION_24 =
  "shadow-[0_11px_15px_-7px_rgba(0,0,0,0.2),0_24px_38px_3px_rgba(0,0,0,0.14),0_9px_46px_8px_rgba(0,0,0,0.12)]";

/** Material Designのelevation 16相当の影（サイドメニュー用） */
const ELEVATION_16 =
  "shadow-[0_8px_10px_-5px_rgba(0,0,0,0.2),0_16px_24px_2px_rgba(0,0,0,0.14),0_6px_30px_5px_rgba(0,0,0,0.12)]";

export const uiTheme = {
  colors: {
    primary: "blue",
    secondary: "violet",
    success: "green",
    info: "sky",
    warning: "orange",
    error: "red",
    neutral: "zinc",
  },
  button: {
    slots: {
      base: [
        "rounded-[4px] font-medium uppercase leading-normal justify-center shrink-0 whitespace-nowrap no-underline tracking-[0.0892857143em] indent-[0.0892857143em] select-none",
        "transition-[box-shadow,background-color,color,opacity] duration-[280ms]",
      ],
    },
    variants: {
      size: {
        xs: {
          base: "h-5 min-w-9 px-2 text-[0.625rem] gap-1",
          leadingIcon: "size-[1.2857em] -ms-0.5",
          trailingIcon: "size-[1.2857em]",
        },
        sm: {
          base: "h-7 min-w-[50px] px-3 text-xs gap-1.5",
          leadingIcon: "size-[1.2857em] -ms-[3px]",
          trailingIcon: "size-[1.2857em]",
        },
        md: {
          base: "h-9 min-w-16 px-4 text-sm gap-2",
          leadingIcon: "size-[1.2857em] -ms-1",
          trailingIcon: "size-[1.2857em]",
        },
        lg: {
          base: "h-11 min-w-[78px] px-5 text-base gap-2.5",
          leadingIcon: "size-[1.2857em] -ms-[5px]",
          trailingIcon: "size-[1.2857em]",
        },
        xl: {
          base: "h-[52px] min-w-[92px] px-6 text-lg gap-3",
          leadingIcon: "size-[1.2857em] -ms-1.5",
          trailingIcon: "size-[1.2857em]",
        },
      },
      variant: {
        solid: ELEVATION_2,
      },
    },
    compoundVariants: [
      // Material Designのelevated/flatボタンと同じく、ダークモードでも白文字を使う。
      // Tailwindがクラス名を検出できるよう、色ごとに文字列で列挙する。
      {
        color: "primary",
        variant: "solid",
        class:
          "bg-primary text-white hover:bg-primary hover:brightness-110 active:bg-primary disabled:bg-primary aria-disabled:bg-primary",
      },
      {
        color: "secondary",
        variant: "solid",
        class:
          "bg-secondary text-white hover:bg-secondary hover:brightness-110 active:bg-secondary disabled:bg-secondary aria-disabled:bg-secondary",
      },
      {
        color: "success",
        variant: "solid",
        class:
          "bg-success text-white hover:bg-success hover:brightness-110 active:bg-success disabled:bg-success aria-disabled:bg-success",
      },
      {
        color: "info",
        variant: "solid",
        class:
          "bg-info text-white hover:bg-info hover:brightness-110 active:bg-info disabled:bg-info aria-disabled:bg-info",
      },
      {
        color: "warning",
        variant: "solid",
        class:
          "bg-warning text-white hover:bg-warning hover:brightness-110 active:bg-warning disabled:bg-warning aria-disabled:bg-warning",
      },
      {
        color: "error",
        variant: "solid",
        class:
          "bg-error text-white hover:bg-error hover:brightness-110 active:bg-error disabled:bg-error aria-disabled:bg-error",
      },
      // Material Designのoutlinedボタンと同じく、文字色と同じ細い枠線を付ける。
      {
        color: "primary",
        variant: "outline",
        class:
          "ring-0 border border-current bg-transparent text-primary hover:bg-primary/[0.04] active:bg-primary/[0.1]",
      },
      {
        color: "secondary",
        variant: "outline",
        class:
          "ring-0 border border-current bg-transparent text-secondary hover:bg-secondary/[0.04] active:bg-secondary/[0.1]",
      },
      {
        color: "success",
        variant: "outline",
        class:
          "ring-0 border border-current bg-transparent text-success hover:bg-success/[0.04] active:bg-success/[0.1]",
      },
      {
        color: "info",
        variant: "outline",
        class:
          "ring-0 border border-current bg-transparent text-info hover:bg-info/[0.04] active:bg-info/[0.1]",
      },
      {
        color: "warning",
        variant: "outline",
        class:
          "ring-0 border border-current bg-transparent text-warning hover:bg-warning/[0.04] active:bg-warning/[0.1]",
      },
      {
        color: "error",
        variant: "outline",
        class:
          "ring-0 border border-current bg-transparent text-error hover:bg-error/[0.04] active:bg-error/[0.1]",
      },
      {
        color: "neutral",
        variant: "outline",
        class:
          "ring-0 border border-current bg-transparent text-inherit hover:bg-current/[0.04] active:bg-current/[0.1]",
      },
      {
        color: "neutral",
        variant: "ghost",
        class:
          "text-inherit hover:bg-current/[0.04] active:bg-current/[0.1] focus-visible:bg-current/[0.12]",
      },
    ],
  },
  alert: {
    slots: {
      root: "rounded-[4px] p-4 gap-4 items-start",
      wrapper: "self-center",
      description: "text-[length:inherit] leading-[inherit] opacity-100",
      icon: "size-7",
      actions: "self-start",
      close:
        "size-8 justify-center rounded-full p-0 text-inherit hover:text-inherit",
    },
    compoundVariants: [
      // Material Designのtonal表示に合わせ、背景は文字色の12%にする。
      { color: "success", variant: "soft", class: { root: "bg-success/12" } },
      { color: "info", variant: "soft", class: { root: "bg-info/12" } },
      { color: "warning", variant: "soft", class: { root: "bg-warning/12" } },
      { color: "error", variant: "soft", class: { root: "bg-error/12" } },
    ],
  },
  modal: {
    slots: {
      overlay: "z-[2400]",
      content: `z-[2400] bg-white dark:bg-[#212121] text-black/87 dark:text-white rounded-[4px] ring-0 divide-y-0 ${ELEVATION_24}`,
    },
    variants: {
      // Material Designのダイアログと同じく、ライトは黒・ダークは白を32%で重ねる。
      overlay: {
        true: {
          overlay: "bg-(--app-scrim)/[0.32]",
        },
      },
      fullscreen: {
        false: {
          content: `rounded-[4px] ring-0 ${ELEVATION_24}`,
        },
      },
    },
  },
  slideover: {
    slots: {
      content: `bg-white dark:bg-[#212121] text-black/87 dark:text-white ring-0 sm:ring-0 divide-y-0 ${ELEVATION_16}`,
    },
  },
};
