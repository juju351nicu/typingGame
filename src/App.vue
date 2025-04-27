<template>
  <router-view />
</template>

<script>
import { useCounterStore } from "./stores/counter";
import { SidebarMenu } from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
export default {
  name: "App",
  setup() {
    //インポートした関数を呼び出してストアをインスタンス化して変数に代入
    const store = useCounterStore(); //setup() 内で useXxxxStore() を実行
    return {
      //テンプレートで使用するストアのインスタンス全体を返すことができます
      store,
    };
  },
  components: {
    SidebarMenu,
  },
  methods: {},
};
</script>

