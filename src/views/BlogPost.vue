<script setup lang="ts">
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import MarkdownIt from "markdown-it";
import { sanitize } from '@markdown-design/markdown-it-sanitize';
import { onBeforeMount, ref } from "vue";
import Fetcher from "@/utils/rest";
import Const from "@/constants/const";
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.min.css'
const router = useRouter();
/** Propsインタフェース定義 */
interface Props {
  section: string;
  id: string;
}
/** Propsインタフェース定義 */
const props = defineProps<Props>();

/* Hacky navigation when a href link is clicked within the compiled html Post */
onBeforeRouteUpdate(async () => {
  location.reload();
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
/** Htmlに表示するマークダウン情報をセットする。 */
onBeforeMount(async () => {
  document.title = "ブログ記事";
  await Fetcher.getRequest(Const.BLOG_PATH.POST_FOLDER + props.section + "/" + props.id + ".md")
    .then(response => {
      return response.text();
    })
    .then(body => {
      postHtml.value = markDownIt.render(body);
    });
});
</script>
<template>
  <v-container style="background-color: white">
    <div class="markdown-body" :style="`background-color: 'blue' ; color: 'white';`" v-html="postHtml" />
    <v-btn @click="goBlogList()"> &laquo; Back </v-btn>
  </v-container>
</template>
<style scoped>
/* NOTE: VuetifyのCSS Resetで崩れる＋調整の為 */
div :deep(hr) {
  margin: 20px 0;
}

div :deep(p) {
  margin: 0 0 10px 0;
}

div>>>h1,
div>>>h2,
div>>>h3 {
  margin: 20px 0 10px 0;
}

div>>>h4,
div>>>h5,
div>>>h6 {
  margin: 10px 0;
}

div>>>blockquote {
  margin: 0 0 20px 0;
  padding: 10px 20px;
  border-left: 5px solid rgb(var(--v-theme-background-2));
  /* <- #eee; */
}

div>>>ul,
div>>>ol {
  margin: 0 0 10px 0;
  padding: 0 0 0 40px;
}

div>>>ul ul,
div>>>ol ul,
div>>>ul ol,
div>>>ol ol {
  margin: 0;
}

div>>>code {
  padding: 2px 4px;
  font-size: 90%;
  color: rgb(var(--v-theme-accent));
  /* <- #d73a49; <- #c7254e; */
  background-color: rgb(var(--v-theme-background-1));
  /* <- #f9f2f4; */
  border-radius: 4px;
}

div>>>pre {
  padding: 9.5px;
  margin: 0 0 10px 0;
  word-break: break-all;
  background-color: rgb(var(--v-theme-background-1));
  /* <- #f5f5f5; */
  border: 1px solid rgb(var(--v-theme-background-2));
  /* <- #ccc; */
  border-radius: 4px;
}

div>>>pre code {
  padding: 0;
  font-size: inherit;
  color: inherit;
  white-space: pre-wrap;
}

div>>>table {
  width: 100%;
  margin: 0 0 20px 0;
  border-collapse: collapse;
}

div>>>th {
  padding: 8px;
  border-bottom: 2px solid rgb(var(--v-theme-background-2));
  /* <- #ddd; */
}

div>>>tr:nth-child(odd)>td {
  background-color: rgb(var(--v-theme-background-1));
  /* <- #f9f9f9; */
}

div>>>td {
  padding: 8px;
  border-top: 1px solid rgb(var(--v-theme-background-2));
  /* <- #ddd; */
}

div>>>img {
  max-width: 35%;
  vertical-align: middle;
}
</style>