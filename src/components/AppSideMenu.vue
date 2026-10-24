<script setup lang="ts">
import USlideover from "@nuxt/ui/components/Slideover.vue";
import UIcon from "@nuxt/ui/components/Icon.vue";
import { computed, ref } from "vue";

interface SideMenuProps {
  /** サイドメニューを開いているか */
  drawer: boolean;
}

interface MenuLink {
  to: {
    name: string;
  };
  title: string;
  icon: string;
}

const props = defineProps<SideMenuProps>();

const emit = defineEmits<{
  "update:drawer": [value: boolean];
}>();

/** 親コンポーネントと同期するサイドメニューの開閉状態 */
const drawer = computed({
  get: (): boolean => props.drawer,
  set: (value: boolean) => emit("update:drawer", value),
});

/**
 * メニュー外の操作でメニューを閉じるとき、開閉ボタン自体の操作は除外する。
 *
 * 除外しないと、ボタンを押した瞬間に閉じた後でクリックにより再び開いてしまう。
 *
 * @param event Reka UIのメニュー外操作イベント
 */
const ignoreToggleButton = (event: Event): void => {
  const target = event.target;
  if (target instanceof Element && target.closest("[data-side-menu-toggle]")) {
    event.preventDefault();
  }
};

/** サイドメニューに表示するページリンク */
const links = ref<MenuLink[]>([
  {
    to: { name: "GamePage" },
    title: "ゲーム",
    icon: "i-lucide-house",
  },
  {
    to: { name: "RankingPage" },
    title: "ランキング",
    icon: "i-lucide-trophy",
  },
  {
    to: { name: "SettingsPage" },
    title: "設定",
    icon: "i-lucide-settings",
  },
  {
    to: { name: "BlogPostList" },
    title: "開発ブログ",
    icon: "i-lucide-newspaper",
  },
  {
    to: { name: "AboutUs" },
    title: "このサイトについて",
    icon: "i-lucide-info",
  },
]);
</script>
<template>
  <!--
    従来の一時表示メニューと同じく、背景のスクロールは止めない。
    modal=falseではNuxt UIのオーバーレイが描画されないため、半透明の背景は自前で置く。
    背景のクリックはスライドオーバー外の操作として扱われ、メニューが閉じる。
  -->
  <Teleport to="body">
    <Transition name="side-menu-fade">
      <div v-if="drawer" class="side-menu__scrim" aria-hidden="true" />
    </Transition>
  </Teleport>
  <USlideover
    v-model:open="drawer"
    :modal="false"
    side="left"
    title="メニュー"
    description="ページを選択してください"
    :content="{ onInteractOutside: ignoreToggleButton }"
    :ui="{ content: 'side-menu' }"
  >
    <template #content>
      <nav class="side-menu__nav" aria-label="サイトメニュー">
        <ul v-for="link in links" :key="link.title" class="side-menu__list">
          <li>
            <router-link
              :to="link.to"
              class="side-menu__item"
              @click="drawer = false"
            >
              <UIcon :name="link.icon" class="side-menu__icon" />
              <span class="side-menu__title">{{ link.title }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </template>
  </USlideover>
</template>
<style>
/* 固定ヘッダーの下に、従来の一時表示メニューと同じ幅で表示する。 */
.side-menu {
  bottom: 0;
  height: auto;
  max-width: 256px;
  overflow-y: auto;
  top: 64px;
  width: 256px;
}

.side-menu.side-menu {
  z-index: 1006;
}

.side-menu__scrim {
  background: #000000;
  bottom: 0;
  left: 0;
  opacity: 0.2;
  position: fixed;
  right: 0;
  top: 64px;
  z-index: 1005;
}

.side-menu-fade-enter-active,
.side-menu-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.side-menu-fade-enter-from,
.side-menu-fade-leave-to {
  opacity: 0;
}

.side-menu__list {
  list-style: none;
  padding: 8px 0;
}

.side-menu__item {
  align-items: center;
  color: inherit;
  display: flex;
  min-height: 48px;
  opacity: 0.62;
  outline: none;
  padding: 4px 16px;
  text-decoration: none;
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.side-menu__item:hover,
.side-menu__item:focus-visible {
  opacity: 1;
}

.side-menu__icon {
  flex-shrink: 0;
  height: 24px;
  margin-inline-end: 32px;
  width: 24px;
}

.side-menu__title {
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.009375em;
  line-height: 1.5rem;
}
</style>
