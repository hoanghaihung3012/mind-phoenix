import { generateIconTextures } from "./icons.js";
import { generateMapTextures, PLATE_INFO } from "./mapArt.js";
import { generateMiscTextures } from "./miscArt.js";
import { drawCharacter, SKIN_STYLES, TEACHER_STYLE, SKIN_TONE } from "./characterArt.js";
import { drawPet, PET_KEYS } from "./petArt.js";
import { TEXTURES, CanvasGraphics } from "./draw.js";

export {
  generateIconTextures,
  generateMapTextures,
  generateMiscTextures,
  PLATE_INFO,
  drawCharacter,
  SKIN_STYLES,
  TEACHER_STYLE,
  SKIN_TONE,
  drawPet,
  PET_KEYS,
  TEXTURES,
  CanvasGraphics,
};

export const TEXTURE_TASKS = [
  { label: "Đang vẽ biểu tượng...", run: generateIconTextures },
  { label: "Đang dựng bản đồ trường...", run: generateMapTextures },
  { label: "Đang chuẩn bị mini-game...", run: generateMiscTextures },
];

export function buildAllTextures(scene = null) {
  for (const task of TEXTURE_TASKS) {
    task.run(scene);
  }
  return TEXTURES;
}
