import {
  Bath,
  Beef,
  Bird,
  Bone,
  Cat,
  Dog,
  Fish,
  House,
  Package,
  PawPrint,
  Pill,
  Rabbit,
  Tag,
  Volleyball,
  type LucideIcon,
} from "lucide-react";
import type { PetType } from "./types";

interface Look {
  icon: LucideIcon;
  className: string;
}

const categoryLooks: Record<string, Look> = {
  food: { icon: Beef, className: "bg-orange-500/12 text-orange-600 dark:text-orange-300" },
  treats: { icon: Bone, className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  toys: { icon: Volleyball, className: "bg-violet-500/12 text-violet-600 dark:text-violet-300" },
  accessories: { icon: Tag, className: "bg-sky-500/12 text-sky-600 dark:text-sky-300" },
  grooming: { icon: Bath, className: "bg-cyan-500/12 text-cyan-700 dark:text-cyan-300" },
  health: { icon: Pill, className: "bg-rose-500/12 text-rose-600 dark:text-rose-300" },
  habitat: { icon: House, className: "bg-lime-500/15 text-lime-700 dark:text-lime-300" },
};

const fallbackLook: Look = { icon: Package, className: "bg-muted text-muted-foreground" };

export function getCategoryLook(categoryName: string): Look {
  return categoryLooks[categoryName.toLowerCase()] ?? fallbackLook;
}

export const petTypeIcons: Record<PetType, LucideIcon> = {
  Dog,
  Cat,
  Bird,
  Fish,
  SmallPet: Rabbit,
  AllPets: PawPrint,
};
