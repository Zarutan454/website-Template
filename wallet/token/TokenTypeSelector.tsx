import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TokenTypeSelectorProps {
  value: string;
  onValueChange: (value: "standard" | "marketing" | "business") => void;
}

export function TokenTypeSelector({ value, onValueChange }: TokenTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Token Type</Label>
      <RadioGroup
        defaultValue={value}
        onValueChange={onValueChange}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div>
          <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
          <Label
            htmlFor="standard"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span>Standard</span>
            <span className="text-xs text-muted-foreground">Basic ERC20 token</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="marketing" id="marketing" className="peer sr-only" />
          <Label
            htmlFor="marketing"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span>Marketing</span>
            <span className="text-xs text-muted-foreground">With tax and marketing features</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="business" id="business" className="peer sr-only" />
          <Label
            htmlFor="business"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <span>Business</span>
            <span className="text-xs text-muted-foreground">All advanced features</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
