import {
  CliRenderer,
  BoxRenderable,
  TextRenderable,
  RGBA,
} from "@opentui/core";
import { EventBus, KeymapEvents } from "../events";

const BG_COLOR_NORMAL = "#0000aaff";

export const yesNoDialog = (renderer: CliRenderer, text: string): void => {
  const focusedRenderable = renderer.currentFocusedRenderable;
  focusedRenderable?.blur();
  const box = new BoxRenderable(renderer, {
    id: "popup",
    width: "auto",
    height: 3,
    border: true,
    borderStyle: "double",
    backgroundColor: RGBA.fromHex(BG_COLOR_NORMAL),
    position: "absolute",
    alignSelf: "center",
    top: "50%",
    paddingX: 2,
  });
  box.add(
    new TextRenderable(renderer, {
      content: text,
      width: "100%",
      alignSelf: "center",
      height: 1,
    }),
  );
  renderer.root.add(box);
  box.focus();

  EventBus.once(KeymapEvents.escPressed, () => {
    focusedRenderable?.focus();
    box.destroy();
  });
};
