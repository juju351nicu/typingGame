<script setup lang="ts">
import { computed } from "vue";

interface Props {
  /** 円の直径（px） */
  size?: number;
  /** 線の太さ（px） */
  width?: number;
  /** 進捗線の色（CSSの色指定） */
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
  width: 4,
  color: "currentColor",
});

/** SVG座標系での円の半径。viewBoxを太さに合わせて広げ、線が欠けないようにする。 */
const RADIUS = 20;

/** viewBoxの一辺 */
const diameter = computed((): number => {
  return (RADIUS / (1 - props.width / props.size)) * 2;
});

/** viewBox座標系での線の太さ */
const strokeWidth = computed((): number => {
  return (props.width / props.size) * diameter.value;
});
</script>
<template>
  <div
    class="app-progress-circular"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :style="{
      width: `${props.size}px`,
      height: `${props.size}px`,
      color: props.color,
    }"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="`0 0 ${diameter} ${diameter}`"
      aria-hidden="true"
    >
      <circle
        class="app-progress-circular__underlay"
        fill="transparent"
        cx="50%"
        cy="50%"
        :r="RADIUS"
        :stroke-width="strokeWidth"
      />
      <circle
        class="app-progress-circular__overlay"
        fill="transparent"
        cx="50%"
        cy="50%"
        :r="RADIUS"
        :stroke-width="strokeWidth"
      />
    </svg>
  </div>
</template>
<style scoped>
.app-progress-circular {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  position: relative;
  vertical-align: middle;
}

.app-progress-circular > svg {
  animation: app-progress-circular-rotate 1.4s linear infinite;
  bottom: 0;
  height: 100%;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  transform-origin: center center;
  width: 100%;
}

.app-progress-circular__underlay {
  stroke: var(--app-progress-underlay, rgba(0, 0, 0, 0.12));
}

:root.dark .app-progress-circular__underlay {
  --app-progress-underlay: rgba(255, 255, 255, 0.12);
}

.app-progress-circular__overlay {
  animation:
    app-progress-circular-dash 1.4s ease-in-out infinite,
    app-progress-circular-rotate 1.4s linear infinite;
  stroke: currentColor;
  stroke-dasharray: 25, 200;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center center;
}

@keyframes app-progress-circular-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100, 200;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 100, 200;
    stroke-dashoffset: -124px;
  }
}

@keyframes app-progress-circular-rotate {
  100% {
    transform: rotate(270deg);
  }
}
</style>
