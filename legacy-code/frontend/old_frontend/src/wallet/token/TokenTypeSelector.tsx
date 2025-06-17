
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Coins, TrendingUp, Building2, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TokenTypeSelectorProps {
  value: string;
  onValueChange: (value: "standard" | "marketing" | "business") => void;
}

const tokenTypes = [
  {
    id: "standard",
    title: "Standard",
    description: "Basic ERC-20/ERC-721 token",
    features: ["Transfers", "Approvals", "Burns", "Basic Minting"],
    icon: Coins,
    complexity: "Einfach",
    benefits: "Ideal für einfache Anwendungsfälle und Proof-of-Concept-Projekte."
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "With tax and marketing features",
    features: ["Transfer Taxes", "Marketing Wallet", "Auto-Liquidity", "Buyback Mechanism"],
    icon: TrendingUp,
    complexity: "Mittel",
    benefits: "Perfekt für Projekte mit Marketing-Budget und Community-Building-Fokus."
  },
  {
    id: "business",
    title: "Business",
    description: "Advanced enterprise features",
    features: ["Governance", "Vesting", "Multiple Wallets", "Transfer Limits", "Access Control"],
    icon: Building2,
    complexity: "Komplex",
    benefits: "Optimal für Unternehmen und Projekte mit komplexen Anforderungen."
  }
];

export function TokenTypeSelector({ value, onValueChange }: TokenTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-medium">Token Type</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              <span className="mr-1">Was ist der Unterschied?</span>
              <Info className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-md p-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Token-Typen im Überblick:</h4>
                <p>
                  <strong>Standard:</strong> Einfacher ERC-20 Token mit Grundfunktionen.
                </p>
                <p>
                  <strong>Marketing:</strong> Erweiterter Token mit Steuern für Marketing und Liquidität.
                </p>
                <p>
                  <strong>Business:</strong> Komplexer Token mit Governance, Vesting und Transferbeschränkungen.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {tokenTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = value === type.id;
          
          return (
            <div key={type.id}>
              <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
              <Label
                htmlFor={type.id}
                className={cn(
                  "flex flex-col h-full rounded-md border-2 border-muted bg-popover p-4",
                  "hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                  "peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary",
                  isSelected && "border-primary bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{type.title}</span>
                  <Icon className={cn(
                    "h-5 w-5",
                    isSelected ? "text-primary" : "text-primary/70"
                  )} />
                </div>
                <span className="text-xs text-muted-foreground mb-2">{type.description}</span>
                <div className="mt-auto">
                  <div className="flex items-center mt-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      type.complexity === "Einfach" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      type.complexity === "Mittel" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {type.complexity}
                    </span>
                  </div>
                  <ul className="mt-2 text-xs space-y-1">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full mr-1.5",
                          isSelected ? "bg-primary" : "bg-primary/70"
                        )} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
