
import React from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Bestimme das Icon und die Tooltip-Beschreibung je nach aktivem Theme
  const getActiveIcon = () => {
    if (theme === "light") {
      return <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-amber-500" />;
    } else if (theme === "dark") {
      return <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-indigo-400" />;
    } else {
      return <Monitor className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />;
    }
  };

  const getTooltipText = () => {
    if (theme === "light") return "Helligkeitsmodus";
    if (theme === "dark") return "Dunkelmodus";
    return "Systemeinstellung";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-muted transition-colors relative"
          title={getTooltipText()}
        >
          {getActiveIcon()}
          <span className="sr-only">Theme wechseln</span>
          
          {/* Dezente Animation, um auf die Funktion hinzuweisen */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="absolute inset-0 rounded-md"
            style={{ 
              boxShadow: 'inset 0 0 0 1px rgba(var(--primary-rgb), 0.1)', 
            }} 
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className="hover:bg-muted cursor-pointer flex items-center"
        >
          <Sun className="mr-2 h-4 w-4 text-amber-500" />
          <span>Hell</span>
          {theme === "light" && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto h-2 w-2 rounded-full bg-primary"
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className="hover:bg-muted cursor-pointer flex items-center"
        >
          <Moon className="mr-2 h-4 w-4 text-indigo-400" />
          <span>Dunkel</span>
          {theme === "dark" && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto h-2 w-2 rounded-full bg-primary"
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className="hover:bg-muted cursor-pointer flex items-center"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto h-2 w-2 rounded-full bg-primary"
            />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
