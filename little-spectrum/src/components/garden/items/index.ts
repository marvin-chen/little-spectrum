import type { GardenItemDefinition } from "./types";
import { Sprout } from "./Sprout";
import { Tulips } from "./Tulips";
import { Sunflower } from "./Sunflower";
import { Fern } from "./Fern";
import { Mushrooms } from "./Mushrooms";
import { BerryBush } from "./BerryBush";
import { LittleTree } from "./LittleTree";
import { Lantern } from "./Lantern";
import { Birdbath } from "./Birdbath";
import { WateringCan } from "./WateringCan";
import { SteppingStones } from "./SteppingStones";
import { Butterfly } from "./Butterfly";

export { type GardenItemProps, type GardenItemDefinition } from "./types";

export const GARDEN_ITEMS: GardenItemDefinition[] = [
  { key: "sprout", name: "Sprout", blurb: "It started small. So did this.", footprint: "small", Component: Sprout },
  { key: "tulips", name: "Tulip trio", blurb: "Three bright heads, nodding in agreement.", footprint: "medium", Component: Tulips },
  { key: "sunflower", name: "Sunflower", blurb: "Always turning toward the good stuff.", footprint: "large", Component: Sunflower },
  { key: "fern", name: "Fern", blurb: "Soft, green, and perfectly happy in the shade.", footprint: "medium", Component: Fern },
  { key: "mushrooms", name: "Mushroom cluster", blurb: "Popped up overnight, as the best things do.", footprint: "small", Component: Mushrooms },
  { key: "berry-bush", name: "Berry bush", blurb: "Sweet little rewards, ready for picking.", footprint: "medium", Component: BerryBush },
  { key: "little-tree", name: "Little tree", blurb: "Give it time and it will give you shade.", footprint: "large", Component: LittleTree },
  { key: "lantern", name: "Garden lantern", blurb: "A warm little light for the late games.", footprint: "small", Component: Lantern },
  { key: "birdbath", name: "Birdbath", blurb: "Everybody deserves a place to splash.", footprint: "medium", Component: Birdbath },
  { key: "watering-can", name: "Watering can", blurb: "Left out, but never forgotten.", footprint: "small", Component: WateringCan },
  { key: "stepping-stones", name: "Stepping stones", blurb: "One stone at a time, all the way across.", footprint: "small", Component: SteppingStones },
  { key: "butterfly", name: "Butterfly", blurb: "It stopped by just to see what you were growing.", footprint: "small", Component: Butterfly },
];

export function getGardenItem(key: string): GardenItemDefinition | undefined {
  return GARDEN_ITEMS.find((item) => item.key === key);
}
