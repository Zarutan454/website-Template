// TODO: Diese Komponente muss auf Django-API migriert werden. Supabase-Logik wurde entfernt.
// Platzhalter-Implementierung, damit der Build funktioniert.

import React from 'react';
import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

interface AirdropRecipient {
  address: string;
  amount: string;
}

const AirdropCreator: React.FC = () => {
  return <div>AirdropCreator (Supabase entfernt, Migration zu Django API nötig)</div>;
};

export default AirdropCreator;
