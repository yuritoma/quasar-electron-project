<template>
  <keep-alive>
    <router-view />
  </keep-alive>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>
