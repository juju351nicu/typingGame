<script setup lang="ts">
import { useTemplateRef } from "vue";
import type { CurrentWord } from "@/types/interfaces";

interface TypingWordsBoardProps {
  currentWords: CurrentWord[];
  getWordFeedbackClass: (word: CurrentWord) => string;
}

defineProps<TypingWordsBoardProps>();

const wordsBoard = useTemplateRef("words-board");

defineExpose({
  get offsetWidth(): number | undefined {
    return wordsBoard.value?.offsetWidth;
  },
  get offsetHeight(): number | undefined {
    return wordsBoard.value?.offsetHeight;
  },
});
</script>
<template>
  <div class="words-board" ref="words-board">
    <template v-for="(word, wordIndex) in currentWords" :key="wordIndex">
      <div
        class="word"
        :class="[
          word.balloonClass,
          getWordFeedbackClass(word),
          { 'word-burst': word.isBursting },
        ]"
        :style="word.style"
      >
        <template v-for="(character, index) in word.characters">
          <span :class="word.classList[index]">{{ character }} </span>
        </template>
      </div>
    </template>
  </div>
</template>
<style scoped>
.words-board {
  background-color: #88bdcc;
  color: #000000;
  flex: 1 1 auto;
  height: 75%;
  padding: 0.5rem;
  font-size: 2.4rem;
  position: relative;
  overflow: hidden;
}

.word {
  position: absolute;
  animation: balloonFloat 2s ease-in-out infinite;
  min-width: 95px;
  min-height: 120px;
  padding: 0.5rem 1rem;
  background: #ff3b5c;
  color: #ffffff;
  border-radius: 50% 50% 48% 48%;
  box-shadow: inset -8px -10px 0 rgba(0, 0, 0, 0.15),
    0 8px 14px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition:
    box-shadow 120ms ease,
    filter 120ms ease,
    transform 120ms ease;
}

.word-active {
  box-shadow:
    0 0 0 4px rgba(255, 255, 255, 0.75),
    0 0 0 8px rgba(81, 207, 102, 0.45),
    inset -8px -10px 0 rgba(0, 0, 0, 0.15),
    0 8px 14px rgba(0, 0, 0, 0.2);
  filter: brightness(1.08);
}

.word-miss {
  animation:
    balloonFloat 2s ease-in-out infinite,
    missShake 160ms ease;
  box-shadow:
    0 0 0 5px rgba(255, 107, 107, 0.55),
    inset -8px -10px 0 rgba(0, 0, 0, 0.15),
    0 8px 14px rgba(0, 0, 0, 0.2);
}

.word::after {
  content: "";
  position: absolute;
  bottom: -75px;
  left: 50%;
  transform: translateX(-50%) rotate(4deg);
  width: 3px;
  height: 80px;
  background: rgba(120, 120, 120, 0.8);
}

.word::before {
  content: "";
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 10px;
  background: #ff4f8b;
  clip-path: polygon(50% 0, 0 100%, 100% 100%);
}

@keyframes balloonFloat {
  0% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-4px) rotate(1deg);
  }

  100% {
    transform: translateY(0px) rotate(0deg);
  }
}

@keyframes missShake {
  0% {
    margin-left: 0;
  }

  35% {
    margin-left: -5px;
  }

  70% {
    margin-left: 5px;
  }

  100% {
    margin-left: 0;
  }
}

@keyframes balloonBurst {
  0% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    filter: brightness(1);
  }

  55% {
    opacity: 1;
    transform: scale(1.22) rotate(-2deg);
    filter: brightness(1.35);
  }

  100% {
    opacity: 0;
    transform: scale(0.2) rotate(10deg);
    filter: brightness(1.5);
  }
}

.word-burst {
  animation: balloonBurst 200ms ease-out forwards;
}

.word-burst span {
  opacity: 0;
}

.word-burst::before,
.word-burst::after {
  content: "";
  position: absolute;
  inset: 50% auto auto 50%;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.95) 0 3px, transparent 4px)
      10px 18px / 42px 42px,
    radial-gradient(circle, rgba(255, 255, 255, 0.8) 0 2px, transparent 3px)
      22px 4px / 36px 36px;
  transform: translate(-50%, -50%) scale(0.7);
  animation: burstParticles 200ms ease-out forwards;
}

.word-burst::after {
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.9) 0 2px, transparent 3px)
      0 8px / 34px 34px,
    radial-gradient(circle, rgba(255, 255, 255, 0.7) 0 2px, transparent 3px)
      18px 18px / 46px 46px;
  animation-delay: 40ms;
}

@keyframes burstParticles {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.4) rotate(0deg);
  }

  35% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.5) rotate(30deg);
  }
}

.word span {
  border-radius: 6px;
  font-size: 1.7rem;
  padding: 0 1px;
}

.balloon-red {
  background: #ff3b5c;
}

.balloon-blue {
  background: #4dabf7;
}

.balloon-green {
  background: #2ee889;
}

.balloon-yellow {
  background: #ffd43b;
}

.balloon-purple {
  background: #b197fc;
}

.correct {
  background: rgba(255, 255, 255, 0.28);
  color: #eaffd0;
  text-shadow: 0 0 8px rgba(47, 158, 68, 0.85);
}

.incorrect {
  background: rgba(255, 255, 255, 0.85);
  color: #d6336c;
  text-shadow: none;
}

@media (max-width: 760px) {
  .words-board {
    height: auto;
    min-height: 0;
  }

  .word {
    min-height: 104px;
    min-width: 82px;
    padding: 0.4rem 0.8rem;
  }

  .word::after {
    bottom: -62px;
    height: 66px;
  }

  .word span {
    font-size: 1.45rem;
  }
}

@media (max-width: 480px) {
  .word {
    min-height: 94px;
    min-width: 74px;
    padding: 0.35rem 0.7rem;
  }

  .word::after {
    bottom: -54px;
    height: 58px;
  }

  .word span {
    font-size: 1.3rem;
  }
}
</style>
