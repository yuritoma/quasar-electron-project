import { createStore } from "vuex";

export default createStore({
  state: {
    userRole: null,
    notification: null, // Add this line to manage notifications
  },
  mutations: {
    setUserRole(state, role) {
      state.userRole = role;
    },
    setNotification(state, notification) {
      // Add this mutation to manage notifications
      state.notification = notification;
    },
  },
});
