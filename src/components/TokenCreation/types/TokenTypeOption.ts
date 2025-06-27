
import { LucideIcon } from 'lucide-react';

export interface TokenTypeOption {
  id: string;
  title: string;
  name: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'Einfach' | 'Mittel' | 'Komplex';
}
