
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ArrowRight } from 'lucide-react';
import { useTokenVesting, VestingSchedule } from '@/hooks/useTokenVesting';
import { addDays, format, addMonths } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';

interface VestingScheduleFormProps {
  tokenId: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  onSuccess?: () => void;
}

const VestingScheduleForm: React.FC<VestingScheduleFormProps> = ({
  tokenId,
  tokenAddress,
  tokenSymbol = 'TOKEN',
  onSuccess
}) => {
  const { isLoading, error, createVestingSchedule } = useTokenVesting();
  const { address } = useAccount();
  const { toast } = useToast();
  
  // State für das Formular
  const [beneficiary, setBeneficiary] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [duration, setDuration] = useState('3'); // Monate
  const [durationUnit, setDurationUnit] = useState('months');
  const [cliff, setCliff] = useState('1'); // Monate
  const [cliffUnit, setCliffUnit] = useState('months');
  const [releaseInterval, setReleaseInterval] = useState('30'); // Tage
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState<Date>(addMonths(new Date(), 3));
  
  // Berechnung des Enddatums basierend auf den Eingaben
  useEffect(() => {
    if (startDate) {
      let newEndDate = new Date(startDate);
      if (durationUnit === 'days') {
        newEndDate = addDays(newEndDate, parseInt(duration) || 0);
      } else if (durationUnit === 'months') {
        newEndDate = addMonths(newEndDate, parseInt(duration) || 0);
      }
      setEndDate(newEndDate);
    }
  }, [startDate, duration, durationUnit]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Berechnung des Startdatums und der Cliff-Dauer in Sekunden
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      let cliffDurationSeconds = 0;
      
      if (cliffUnit === 'days') {
        cliffDurationSeconds = parseInt(cliff) * 24 * 60 * 60;
      } else if (cliffUnit === 'months') {
        // Vereinfachte Berechnung: 1 Monat = 30 Tage
        cliffDurationSeconds = parseInt(cliff) * 30 * 24 * 60 * 60;
      }
      
      // Berechnung der Gesamtdauer in Sekunden
      let durationSeconds = 0;
      if (durationUnit === 'days') {
        durationSeconds = parseInt(duration) * 24 * 60 * 60;
      } else if (durationUnit === 'months') {
        // Vereinfachte Berechnung: 1 Monat = 30 Tage
        durationSeconds = parseInt(duration) * 30 * 24 * 60 * 60;
      }
      
      // Berechnung des Release-Intervalls in Sekunden
      const releaseIntervalSeconds = parseInt(releaseInterval) * 24 * 60 * 60;
      
      const vestingSchedule: VestingSchedule = {
        token_id: tokenId,
        beneficiary: beneficiary,
        amount: amount,
        startTimestamp: startTimestamp,
        duration: durationSeconds,
        cliff: cliffDurationSeconds,
        releaseInterval: releaseIntervalSeconds,
        description: description || undefined
      };
      
      const result = await createVestingSchedule(vestingSchedule);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Vesting schedule created successfully",
          variant: "default"
        });
        
        // Formular zurücksetzen
        setBeneficiary('');
        setAmount('');
        setStartDate(new Date());
        setDuration('3');
        setDurationUnit('months');
        setCliff('1');
        setCliffUnit('months');
        setReleaseInterval('30');
        setDescription('');
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create vesting schedule",
        variant: "destructive"
      });
    }
  };
  
  // Formatieren des Enddatums für die Anzeige
  const formattedEndDate = endDate ? format(endDate, 'PP') : '';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Token Vesting Schedule</CardTitle>
        <CardDescription>
          Allocate tokens to team members, investors, or partners with a customizable vesting schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beneficiary">Beneficiary Address</Label>
            <Input
              id="beneficiary"
              placeholder="0x..."
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              The wallet address that will receive the vested tokens
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Vest ({tokenSymbol})</Label>
            <Input
              id="amount"
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <DatePicker 
                date={startDate} 
                onSelect={(date) => date && setStartDate(date)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className="flex-1"
                />
                <Select value={durationUnit} onValueChange={setDurationUnit}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliff Period</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  min="0"
                  value={cliff}
                  onChange={(e) => setCliff(e.target.value)}
                  required
                  className="flex-1"
                />
                <Select value={cliffUnit} onValueChange={setCliffUnit}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Period before the first tokens are released
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Release Interval (Days)</Label>
              <Input
                type="number"
                min="1"
                value={releaseInterval}
                onChange={(e) => setReleaseInterval(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Frequency of token releases after cliff
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="e.g. Team allocation, Advisor tokens"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          {/* Vesting Summary */}
          <Alert variant="info" className="bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary-700 dark:text-primary-300">
              <div className="flex items-center justify-between my-1">
                <span>Start Date:</span>
                <span className="font-medium">{format(startDate, 'PP')}</span>
              </div>
              <div className="flex items-center justify-between my-1">
                <span>End Date:</span>
                <span className="font-medium">{formattedEndDate}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Cliff Period:</span>
                <span className="font-medium">{cliff} {cliffUnit}</span>
              </div>
            </AlertDescription>
          </Alert>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Schedule...' : 'Create Vesting Schedule'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default VestingScheduleForm;
