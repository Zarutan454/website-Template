import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

const vestingFormSchema = z.object({
  beneficiaryAddress: z.string().min(1, "Beneficiary address is required"),
  totalAmount: z.string().min(1, "Total amount is required"),
  startDate: z.string().min(1, "Start date is required"),
  duration: z.string().min(1, "Duration is required"),
  cliffDuration: z.string().optional(),
});

interface VestingScheduleFormProps {
  tokenId: string;
  onSuccess?: () => void;
}

export function VestingScheduleForm({ tokenId, onSuccess }: VestingScheduleFormProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<z.infer<typeof vestingFormSchema>>({
    resolver: zodResolver(vestingFormSchema),
    defaultValues: {
      beneficiaryAddress: "",
      totalAmount: "",
      startDate: new Date().toISOString().split("T")[0],
      duration: "365",
      cliffDuration: "90",
    },
  });

  const onSubmit = async (values: z.infer<typeof vestingFormSchema>) => {
    try {
      setIsCreating(true);

      const vestingData: TablesInsert<"token_vesting_schedules"> = {
        token_id: tokenId,
        beneficiary_address: values.beneficiaryAddress,
        total_amount: parseFloat(values.totalAmount),
        start_date: new Date(values.startDate).toISOString(),
        end_date: new Date(
          new Date(values.startDate).getTime() +
            parseInt(values.duration) * 24 * 60 * 60 * 1000
        ).toISOString(),
        cliff_duration: values.cliffDuration ? `${values.cliffDuration} days` : null,
        vesting_interval: "30 days",
      };

      const { error } = await supabase
        .from("token_vesting_schedules")
        .insert(vestingData);

      if (error) throw error;

      toast({
        title: "Vesting Schedule erstellt",
        description: `Vesting Schedule für ${values.totalAmount} Token erstellt.`,
      });

      if (onSuccess) onSuccess();
      form.reset();
    } catch (error) {
      console.error("Error creating vesting schedule:", error);
      toast({
        title: "Fehler beim Erstellen des Vesting Schedules",
        description: error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="beneficiaryAddress">Empfänger-Adresse</Label>
        <Input
          id="beneficiaryAddress"
          {...form.register("beneficiaryAddress")}
          placeholder="0x..."
        />
      </div>

      <div>
        <Label htmlFor="totalAmount">Gesamtbetrag</Label>
        <Input
          id="totalAmount"
          type="number"
          {...form.register("totalAmount")}
          placeholder="Geben Sie den Gesamtbetrag ein"
        />
      </div>

      <div>
        <Label htmlFor="startDate">Startdatum</Label>
        <Input
          id="startDate"
          type="date"
          {...form.register("startDate")}
        />
      </div>

      <div>
        <Label htmlFor="duration">Dauer (in Tagen)</Label>
        <Input
          id="duration"
          type="number"
          {...form.register("duration")}
          placeholder="365"
        />
      </div>

      <div>
        <Label htmlFor="cliffDuration">Cliff-Dauer (in Tagen, optional)</Label>
        <Input
          id="cliffDuration"
          type="number"
          {...form.register("cliffDuration")}
          placeholder="90"
        />
      </div>

      <Button type="submit" disabled={isCreating}>
        {isCreating ? "Schedule wird erstellt..." : "Vesting Schedule erstellen"}
      </Button>
    </form>
  );
}