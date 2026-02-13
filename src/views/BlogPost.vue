<script setup lang="ts">
import { onBeforeRouteUpdate, useRouter } from "vue-router";
import MarkdownIt from "markdown-it";
// import { sanitize } from '@markdown-design/markdown-it-sanitize';
import { onBeforeMount, ref } from "vue";
import Fetcher from "@/utils/rest";
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
const markDownIt = new MarkdownIt({ html: true });
// markDownIt.use(sanitize);
/** Htmlに表示するマークダウン情報をセットする。 */
onBeforeMount(async () => {
  document.title = "ブログ記事";
  await Fetcher.getRequest("/blog_store/posts/" + props.section + "/" + props.id + ".md")
    .then(response => {
      return response.text();
    })
    .then(body => {
      postHtml.value = markDownIt.render(body);
    });
});
</script>
<template>
  <!-- <PatchMeta :title="title" /> -->
  <v-container style="background-color: white">
    <span class="markdown-body" :style="`background-color: 'blue' ; color: 'white';`" v-html="postHtml" />
    <v-btn @click="goBlogList()"> &laquo; Back </v-btn>
  </v-container>
</template>