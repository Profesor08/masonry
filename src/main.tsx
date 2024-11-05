import { Masonry } from "@/masonry/Masonry";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./main.css";

const grid = document.querySelector(".masonry-grid");

if (grid !== null) {
  new Masonry(grid);
}

const app = document.querySelector("#app");

if (app !== null) {
  const root = createRoot(app);

  root.render(<App />);
}
