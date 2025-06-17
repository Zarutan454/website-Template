
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertTriangle, Info, ArrowRight } from "lucide-react";

export const DesignSystemExample = () => {
  return (
    <div className="p-8 space-y-10">
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Farben</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-lg bg-primary"></div>
            <span className="mt-2">Primary</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-lg bg-secondary"></div>
            <span className="mt-2">Secondary</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-lg bg-accent"></div>
            <span className="mt-2">Accent</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-lg bg-dark-100"></div>
            <span className="mt-2">Dark</span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Typografie</h2>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Headline 1</h1>
          <h2 className="text-3xl font-bold">Headline 2</h2>
          <h3 className="text-2xl font-bold">Headline 3</h3>
          <h4 className="text-xl font-bold">Headline 4</h4>
          <p className="text-base">Normaler Text</p>
          <p className="text-sm text-gray-400">Kleiner Text</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Standard</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button className="btn-gradient">Gradient</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Karten</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-dark-100 border-gray-800">
            <CardHeader>
              <CardTitle>Kartenkomponente</CardTitle>
              <CardDescription>Dies ist eine Beispielkarte</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Hier kommt der Inhalt der Karte.</p>
              <div className="mt-4">
                <Progress value={60} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost">Abbrechen</Button>
              <Button>Speichern</Button>
            </CardFooter>
          </Card>

          <Card className="bg-dark-100 border-gray-800 card-hover">
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>NFT Beispiel</CardTitle>
                  <CardDescription>Mit Hover-Effekt</CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary-400/10 text-primary-400 border-primary-400/20">
                  <Check className="h-3 w-3 mr-1" /> Verifiziert
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-square overflow-hidden rounded-md bg-gray-800">
                <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400">
                  NFT Bild
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-400">Preis</div>
              <div className="font-semibold">2.5 ETH</div>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Tabs</h2>
        <Tabs defaultValue="konto" className="max-w-md">
          <TabsList className="bg-dark-100 border-gray-800">
            <TabsTrigger value="konto">Konto</TabsTrigger>
            <TabsTrigger value="passwort">Passwort</TabsTrigger>
            <TabsTrigger value="benachrichtigungen">Benachrichtigungen</TabsTrigger>
          </TabsList>
          <TabsContent value="konto" className="bg-dark-100 border-gray-800 p-4 mt-2 rounded-md">
            <p>Kontoeinstellungen hier.</p>
          </TabsContent>
          <TabsContent value="passwort" className="bg-dark-100 border-gray-800 p-4 mt-2 rounded-md">
            <p>Passworteinstellungen hier.</p>
          </TabsContent>
          <TabsContent value="benachrichtigungen" className="bg-dark-100 border-gray-800 p-4 mt-2 rounded-md">
            <p>Benachrichtigungseinstellungen hier.</p>
          </TabsContent>
        </Tabs>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Badges & Indikatoren</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Standard</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-gradient-to-r from-primary-500 to-secondary-500">Gradient</Badge>
          <Badge variant="outline" className="bg-primary-500/10 text-primary-400 border-primary-500/20">
            <Check className="h-3 w-3 mr-1" /> Verifiziert
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" /> Warnung
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Info className="h-3 w-3 mr-1" /> Info
          </Badge>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Glassmorphismus</h2>
        <div className="h-40 relative rounded-lg overflow-hidden bg-gradient-to-br from-primary-500/20 to-secondary-500/20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-panel p-6 w-80">
            <h3 className="font-medium mb-2">Glassmorphismus Effekt</h3>
            <p className="text-sm text-gray-300 mb-4">Ein moderner UI-Trend mit Transparenz und Unschärfe</p>
            <Button size="sm" className="w-full">
              Mehr erfahren <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
