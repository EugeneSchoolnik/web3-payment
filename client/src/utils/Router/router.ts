import Router from "./Router.svelte";
import Route from "./Route.svelte";
import Link from "./Link.svelte";

const routes: [string[], any][] = [];
export const addRoute = (path: string, element: any) => {
  routes.push([path.split("/"), element]);
};

let route = null;
let spareRoute = null;
export const handleRoute = (
  query: Record<string, string>,
  params: Record<string, string>,
) => {
  const path = window.location.pathname.split("/");
  window.location.search
    .replace("?", "")
    .split("&")
    .map((i) => {
      const pair = i.split("=");
      pair[0] && (query[pair[0]] = pair[1]);
    });

  route =
    routes.find((i) => {
      for (let v = 0; v < path.length; v++) {
        if (i[0][v] === "*") {
          spareRoute = i;
          return false;
        }
        if (path.length !== i[0].length) return false;
        if (i[0][v][0] === ":") params[i[0][v].replace(":", "")] = path[v];
        else {
          if (i[0][v] !== path[v]) return false;
        }
      }
      return true;
    }) || spareRoute;

  return route ? route[1] : null;
};

const goTo = (path: string) => {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("popstate"));
};

export { Router, Route, Link, goTo };
