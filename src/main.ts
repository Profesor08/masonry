import "./main.css";
import { Masonry } from "./masonry/Masonry";

const grid = document.querySelector(".masonry-grid");

if (grid !== null) {
  new Masonry(grid);
}
