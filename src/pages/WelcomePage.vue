<template>
  <q-page class="flex flex-center">
    <div>
      <h1 style="text-align: center">Welcome Back,</h1>
      <h1 style="text-align: center; font-style: italic; color: blue">
        {{ capitalizedUsername }}
      </h1>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "WelcomePage",
  data() {
    return {
      username: localStorage.getItem("user") || "Guest",
    };
  },
  computed: {
    capitalizedUsername() {
      return this.username.toUpperCase();
    },
  },
};
</script>
