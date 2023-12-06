const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/LoginPage.vue"),
        name: "login",
      },
      {
        path: "/welcome",
        component: () => import("pages/WelcomePage.vue"),
        name: "welcome",
      },
      {
        path: "/clients",
        component: () => import("pages/ClientsTablePage.vue"),
        name: "clients",
      },
      {
        path: "/users",
        name: "users",
        component: () => import("pages/UsersPage.vue"),
      },
      {
        path: "/vehicles",
        component: () => import("pages/VehiclesPage.vue"),
        name: "vehicles",
        meta: { label: "Vehicles" },
      },
      {
        path: "/vehicle-makes",
        component: () => import("pages/vehicleMake.vue"),
        name: "vehicle-makes",
        meta: { label: "Vehicle Makes" },
      },
      {
        path: "/vehicle-models",
        component: () => import("pages/vehicleModel.vue"),
        name: "vehicle-models",
        meta: { label: "Vehicle Models" },
      },
      {
        path: "/vehicle-types",
        component: () => import("pages/vehicleType.vue"),
        name: "vehicle-types",
        meta: { label: "Vehicle Types" },
      },
      {
        path: "/vehicle-usages",
        component: () => import("pages/vehicleUsage.vue"),
        name: "vehicle-usages",
        meta: { label: "Vehicle Usages" },
      },
    ],
  },

  // Always leave this as the last one
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
