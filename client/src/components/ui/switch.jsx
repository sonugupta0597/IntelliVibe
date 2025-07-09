import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, checked: checkedProp, ...props }, ref) => {
  const checked = checkedProp ?? false;
  return (
    <SwitchPrimitives.Root
      className={cn(
        "relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-0 focus:ring-offset-0",
        checked ? "bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg" : "bg-gray-400"
      )}
      checked={checked}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform",
          checked ? "translate-x-7" : "translate-x-1"
        )}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
