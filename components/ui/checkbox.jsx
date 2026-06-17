import { Checkbox as HeroCheckbox } from "@heroui/react";

function Checkbox({ checked, onCheckedChange, className, ...props }) {
  return (
    <HeroCheckbox
      isSelected={checked}
      onChange={onCheckedChange}
      className={className}
      {...props}
    />
  );
}

export { Checkbox };
