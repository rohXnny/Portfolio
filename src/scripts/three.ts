/**
 * Boots the 3D layer. Each scene is a separate chunk, loaded only when WebGL is
 * available and motion is welcome, so the 2D site stays light for everyone else.
 */
import { enabled } from "../three/support";

/** A sticky, full-viewport stage behind a zone's content. */
function backdrop(zone: HTMLElement | null): HTMLElement | null {
  if (!zone) return null;
  const wrap = document.createElement("div");
  wrap.className = "field-wrap";
  wrap.setAttribute("aria-hidden", "true");
  const stick = document.createElement("div");
  stick.className = "field-stick";
  wrap.append(stick);
  zone.prepend(wrap);
  return stick;
}

if (enabled) {
  const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s);
  const room = $(".scene");
  if (room) import("../three/room").then((m) => m.mountRoom(room));

  const map = $(".sx-map");
  if (map) import("../three/cluster").then((m) => m.mountCluster(map));

  const carScene = $("#car-scene");
  const carSticky = carScene?.querySelector<HTMLElement>(".sticky");
  if (carScene && carSticky) import("../three/car").then((m) => m.mountCar(carSticky, carScene));

  import("../three/field").then(({ mountField }) => {
    const work = backdrop($("#experience"));
    if (work) mountField(work, "shards", 0xbff3f8);
    const skills = backdrop($("#skills"));
    if (skills) mountField(skills, "network", 0x5cd9e8);
    const hire = backdrop($("#hire"));
    if (hire) mountField(hire, "wave", 0xf1c071);
    const contact = backdrop($("#contact"));
    if (contact) mountField(contact, "wave", 0x9db1ff);
  });
}
