export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
} as const;

export const protectedRoutes = [routes.dashboard];

// Anchors on the dashboard that the navbar tabs scroll to.
export const DASHBOARD_SECTIONS = {
  overview: "overview",
  insights: "insights",
  products: "products",
} as const;

// The navbar search button jumps straight to the product search box.
export const DASHBOARD_SEARCH_INPUT_ID = "product-search";
