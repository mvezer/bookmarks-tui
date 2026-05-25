import {
  CliRenderer,
  BoxRenderable,
  TextRenderable,
  RGBA,
} from "@opentui/core";
import { EventBus, KeymapEvents } from "../events";

const BG_COLOR_NORMAL = "#aa0000ff";
const MESSAGE_POSTFIX = "(y)es or (n)o";

export const yesNoDialog = (
  renderer: CliRenderer,
  text: string,
  onYes: () => void,
  onNo: () => void,
): void => {
  const focusedRenderable = renderer.currentFocusedRenderable;
  focusedRenderable?.blur();
  const box = new BoxRenderable(renderer, {
    id: `yesno-dialog`,
    width: "auto",
    height: 5,
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
  box.add(
    new TextRenderable(renderer, {
      content: MESSAGE_POSTFIX,
      width: "auto",
      alignSelf: "center",
      marginTop: 1,
      height: 1,
    }),
  );
  renderer.root.add(box);
  box.focus();

  EventBus.once(KeymapEvents.yPressed, () => {
    focusedRenderable?.focus();
    box.destroy();
    onYes();
  });
  EventBus.once(KeymapEvents.nPressed, () => {
    focusedRenderable?.focus();
    box.destroy();
    onNo();
  });
};
