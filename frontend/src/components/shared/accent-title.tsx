import type { ReactNode } from "react";
import { CardTitle } from "@/components/ui/card";

// Section headings with a short magenta bar in front, the way one31 marks its content rows.
export function AccentTitle({ children }: { children: ReactNode }) {
  return (
    <CardTitle className="flex items-center gap-2">
      <span aria-hidden className="bg-primary h-4 w-1 rounded-full" />
      {children}
    </CardTitle>
  );
}
