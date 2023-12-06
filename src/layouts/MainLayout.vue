<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="showSidebarButton"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title> {{ title }} </q-toolbar-title>
        <div>{{ username ? "Logged in as: " + username : "" }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-if="isLoggedIn"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-3"
    >
      <q-list>
        <q-item-label header> Menu </q-item-label>
        <q-item v-for="menu in menus" :key="menu.title">
          <q-btn-dropdown
            v-if="menu.dropdown"
            unelevated
            class="menu-button"
            :color="menu.title === 'Settings' ? 'grey' : 'primary'"
            :label="menu.title"
            :disable="
              menu.title === 'Settings' && $store.state.userRole !== 'Admin'
            "
          >
            <q-list>
              <q-item
                v-for="submenu in menu.submenus"
                :key="submenu.title"
                clickable
                v-ripple
                @click="handleItemClick(submenu)"
              >
                <q-item-section>{{ submenu.title }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn
            v-else
            unelevated
            class="menu-button"
            :color="'primary'"
            :label="menu.title"
            :to="{ name: menu.link_name }"
            @click="navigateTo(menu)"
            :disable="
              menu.link_name === 'users' && $store.state.userRole !== 'Admin'
            "
          />
        </q-item>
        <q-item>
          <q-btn
            unelevated
            class="menu-button"
            color="red"
            icon-right="logout"
            label="Logout"
            clickable
            v-ripple
            @click="logout"
          />
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }" @login-success="handleLoginSuccess">
        <component :is="Component" />
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useQuasar } from "quasar";
import { computed, watch } from "vue";
import { useStore } from "vuex";
import { Dialog } from "quasar";

export default {
  name: "MainLayout",
  data() {
    return {
      leftDrawerOpen: false,
      isLoggedIn: false,
      menus: [
        { title: "Users", link_name: "users" },
        { title: "Clients", link_name: "clients" },
        { title: "Vehicles", link_name: "vehicles" },
        {
          title: "Settings",
          dropdown: true,
          submenus: [
            { title: "Vehicle Makes", link_name: "vehicle-makes" },
            { title: "Vehicle Models", link_name: "vehicle-models" },
            { title: "Vehicle Types", link_name: "vehicle-types" },
            { title: "Vehicle Usage", link_name: "vehicle-usages" },
          ],
        },
      ],
      title: "Broker Insurance",
      username: "",
    };
  },
  computed: {
    showSidebarButton() {
      return this.$route.name !== "login";
    },
  },
  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    navigateTo(menu) {
      this.toggleLeftDrawer();
      this.$router.push({ name: menu.link_name });
    },

    handleItemClick(submenu) {
      this.toggleLeftDrawer();
      this.$router.push({ name: submenu.link_name });
    },
    handleLoginSuccess(username) {
      this.isLoggedIn = true;
      this.username = username;
    },

    logout() {
      Dialog.create({
        title: "Confirm Logout",
        color: "primary",
        message: "Do you really want to log out?",
        ok: "Yes",
        cancel: "No",
      }).onOk(() => {
        this.isLoggedIn = false;
        this.username = "";
        this.$router.push({ name: "login" });
      });
    },
  },

  watch: {
    $route() {
      this.$store.commit("setNotification", null); // Clear the notification when the route changes
    },
  },

  setup() {
    const $q = useQuasar();
    const store = useStore();

    const notification = computed(() => store.state.notification);

    watch(notification, (newVal) => {
      if (newVal) {
        $q.notify(newVal);
        store.commit("setNotification", null); // Clear the notification
      }
    });

    return {};
  },
};
</script>

<style>
.menu-button {
  width: 150px;
}
</style>
