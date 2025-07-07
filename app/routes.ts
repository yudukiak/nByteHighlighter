import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("nByteHighlighter", "routes/nByteHighlighter.tsx"),
] satisfies RouteConfig;
