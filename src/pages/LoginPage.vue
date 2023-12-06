<template>
  <div id="q-app">
    <q-layout view="lHh Lpr fff">
      <q-page
        class="window-height window-width row justify-center items-center"
        style="background: rgb(192, 201, 196)"
      >
        <div class="column q-pa-lg">
          <div class="row justify-center">
            <div class="text-h5 bold q-mb-md">
              <q-img
                src="/images/insurance2.png"
                style="width: 200px; height: 200px"
              />
            </div>
          </div>
          <div class="row">
            <q-card
              square
              class="shadow-24"
              style="width: 400px; height: 450px"
            >
              <q-card-section class="bg-blue-7">
                <div class="row justify-center items-center">
                  <div>
                    <h4
                      class="bold text-white q-my-md"
                      style="text-align: center"
                    >
                      JOWACO JRF SARL <br />
                      <span
                        class="text-h6 bold text-white q-my-md"
                        style="font-style: italic text-align:center"
                        >Insurance Solutions</span
                      >
                    </h4>
                  </div>
                </div>
              </q-card-section>
              <q-card-section>
                <q-form class="q-px-sm q-pt-xl">
                  <q-input
                    square
                    clearable
                    v-model="username"
                    type="username"
                    label="Username"
                    @keyup.enter="login"
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" />
                    </template>
                  </q-input>
                  <q-input
                    square
                    clearable
                    v-model="password"
                    type="password"
                    label="Password"
                    @keyup.enter="login"
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" />
                    </template>
                  </q-input>
                </q-form>
              </q-card-section>

              <q-card-actions class="q-px-lg">
                <q-btn
                  unelevated
                  size="lg"
                  color="primary"
                  @click="login"
                  class="full-width text-white"
                  label="Login"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-layout>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
      isLoggedIn: false,
    };
  },
  methods: {
    async login() {
      try {
        const response = await window.electron.authenticateUser(
          this.username,
          this.password
        );

        if (response.isAuthenticated) {
          localStorage.setItem("user", this.username);
          localStorage.setItem("isAuthenticated", true); // Store authentication status
          this.$store.commit("setUserRole", response.role); // Use response.role here
          // console.log("User role:", this.$store.state.userRole);
          this.$emit("login-success", this.username);
          this.$router.push("/welcome");
        } else {
          this.showError();
        }
      } catch (error) {
        console.error("Authentication error:", error);
        this.showError();
      }
    },

    showError() {
      this.$root.$q.notify({
        color: "negative",
        message: "Authentication failed! Wrong username/password",
        icon: "report_problem",
        position: "bottom",
      });
    },
  },
};
</script>

<style scoped>
/* Add any additional styling here */
</style>
