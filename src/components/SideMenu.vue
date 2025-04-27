<template>
  <sidebar-menu :menu="menu" />
</template>

<script>
  export default {
    data() {
      return {
        menu: [
          {
            header: 'Main Navigation',
            hiddenOnCollapse: true,
          },
          {
            href: '/',
            title: 'Dashboard',
            icon: 'fa fa-user',
          },
        ],
      }
    },
  }
</script>