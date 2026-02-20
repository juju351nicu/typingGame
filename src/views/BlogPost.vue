<script setup lang="ts">
import Loading from "@/components/Loading.vue";
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import MarkdownIt from "markdown-it";
import { sanitize } from '@markdown-design/markdown-it-sanitize';
import { computed, onBeforeMount, ref } from "vue";
import { useBlogPostsStore } from "@/stores/BlogPosts"
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.min.css'
const router = useRouter();
/** Propsインタフェース定義 */
interface Props {
  section: string;
  id: string;
}
/** ブログのストア情報取得 */
const blogPostsStore = useBlogPostsStore();

/** Propsインタフェース定義 */
const props = defineProps<Props>();

/** データ取得中フラグ */
const isLoading = computed((): boolean => {
  return blogPostsStore.getLoading;
});

/**
 * ブログ記事一覧ページに戻る
 */
const goBlogList = () => {
  router.push({ name: "BlogPostList" });
};
/** Htmlに表示するマークダウン情報 */
const postHtml = ref();
const markDownIt: MarkdownIt = new MarkdownIt({
  html: true,
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
        // return '<pre class="hljs"><code>' + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value + '</code></pre>'
        /* c8 ignore start */
      } catch (__) { }
    }
    return ''
    // return '<pre class="hljs"><code>' + markDownIt.utils.escapeHtml(str) + '</code></pre>'
    /* c8 ignore stop */
  }
});
markDownIt.use(sanitize, {
  // 許可するタグのリストにiframeを追加
  allowedTags: [
    'h1', 'h2', 'p', 'br', 'b', 'i', 'strong', 'em', 'a', 'pre', 'code',
    'iframe' // 許可
  ],
  // 許可するiframeの属性（src, width, heightなど）
  allowedAttributes: {
    'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow']
  }
});

/* Hacky navigation when a href link is clicked within the compiled html Post */
onBeforeRouteUpdate(async () => {
  location.reload();
});

/** Htmlに表示するマークダウン情報をセットする。 */
onBeforeMount(async () => {
  document.title = "ブログ記事";
  postHtml.value = markDownIt.render(await blogPostsStore.recieveBlogPost(props.section, props.id));
});
</script>
<template>
  <v-container style="background-color: white">
    <div class="markdown-body" :style="`background-color: 'blue' ; color: 'white';`" v-html="postHtml" />
    <v-btn @click="goBlogList()"> &laquo; Back </v-btn>
  </v-container>
  <Loading v-if="isLoading" />
</template>
<style scoped>
/* NOTE: VuetifyのCSS Resetで崩れる＋調整の為 */
div :deep(hr) {
  margin: 20px 0;
}

div :deep(p) {
  margin: 0 0 10px 0;
}

div :deep(h1),
div :deep(h2),
div :deep(h3) {
  margin: 20px 0 10px 0;
}

div :deep(h4),
div :deep(h5),
div :deep(h6) {
  margin: 10px 0;
}

div :deep(blockquote) {
  margin: 0 0 20px 0;
  padding: 10px 20px;
  border-left: 5px solid rgb(#eee);
}

div :deep(ul),
div :deep(ol) {
  margin: 0 0 10px 0;
  padding: 0 0 0 40px;
}

div :deep(ul ul),
div :deep(ol ul),
div :deep(ul ol),
div :deep(ol ol) {
  margin: 0;
}

div :deep(code) {
  padding: 2px 4px;
  font-size: 90%;
  color: rgb(#d73a49);
  /* <- #d73a49; <- #c7254e; */
  background-color: rgb(#f9f2f4);
  /* <- #f9f2f4; */
  border-radius: 4px;
}

div :deep(pre) {
  padding: 9.5px;
  margin: 0 0 10px 0;
  word-break: break-all;
  background-color: rgb(#f5f5f5);
  border: 1px solid rgb(#ccc);
  border-radius: 4px;
}

div :deep(pre code) {
  padding: 0;
  font-size: inherit;
  color: inherit;
  white-space: pre-wrap;
}

div :deep(table) {
  width: 100%;
  margin: 0 0 20px 0;
  border-collapse: collapse;
}

div :deep(th) {
  padding: 8px;
  border-bottom: 2px solid rgb(#ddd);
}

div :deep(tr:nth-child(odd)>td) {
  background-color: rgb(#f9f9f9);
}

div :deep(td) {
  padding: 8px;
  border-top: 1px solid rgb(#ddd);
}


div :deep(img) {
  max-width: 35%;
  vertical-align: middle;
}
</style>