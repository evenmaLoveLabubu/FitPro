
import { createRouter, createWebHistory , type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [{path: "/", name: "Frame21", component: () => import("@/views/Frame21.vue"), meta: { guid: "2:1" }},];

const routePathMap = new Map<string, string>();

export const getRoutePathByGuid = (guid: string) => {
  if (!guid) return;
  if (routePathMap.has(guid)) return routePathMap.get(guid);

  const route = routes.find((item) => item.meta?.guid === guid);
  if (!route) return;
  routePathMap.set(guid, route.path);

  return route.path;
}

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
