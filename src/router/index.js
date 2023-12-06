import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import store from "../store";

const createHistory = process.env.SERVER
  ? createMemoryHistory
  : process.env.VUE_ROUTER_MODE === "history"
  ? createWebHistory
  : createWebHashHistory;

const Router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: createHistory(process.env.VUE_ROUTER_BASE),
});

// Router.beforeEach((to, from, next) => {
//   if (to.name === "users" && store.state.userRole !== "Admin") {
//     store.commit("setNotification", {
//       color: "negative",
//       message: "Access denied! You must be an admin to access this page.",
//       icon: "report_problem",
//       position: "bottom",
//     });

//     next("/welcome");
//   } else {
//     next(); // proceed as normal
//   }
// });

export default Router;
