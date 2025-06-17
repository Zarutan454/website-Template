
import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNFTCollections } from '@/hooks/useNFTCollections';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from 'sonner';

const CreateNFTCollection = () => {
  const navigate = useNavigate();
  const { createCollection, isLoading } = useNFTCollections();
  
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [network, setNetwork] = useState('Ethereum');
  const [royaltyFee, setRoyaltyFee] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setLogoImage(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };
  
  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setBannerImage(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    }
  };
  
  const handleCategoryChange = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Bitte gib einen Namen für deine Sammlung ein');
      return;
    }
    
    if (!symbol.trim()) {
      toast.error('Bitte gib ein Symbol für deine Sammlung ein');
      return;
    }
    
    if (!logoPreview) {
      toast.error('Bitte lade ein Logo für deine Sammlung hoch');
      return;
    }
    
    try {
      // In a real app, we would upload the images to storage and get back URLs
      // Here we'll use the preview URLs directly for simplicity
      
      const collectionData = {
        name,
        symbol,
        description,
        network,
        imageUrl: logoPreview,
        bannerUrl: bannerPreview,
        royaltyFee: royaltyFee ? parseFloat(royaltyFee) : 0,
        categories: categories.length > 0 ? categories : null
      };
      
      const newCollection = await createCollection(collectionData);
      
      navigate(`/marketplace`);
    } catch (error) {
      toast.error('Fehler beim Erstellen der Sammlung');
    }
  };
  
  const categoryOptions = [
    { label: 'Kunst', value: 'art' },
    { label: 'Musik', value: 'music' },
    { label: 'Gaming', value: 'gaming' },
    { label: 'Sport', value: 'sports' },
    { label: 'Fotografie', value: 'photography' },
    { label: 'Virtual Worlds', value: 'virtual-worlds' }
  ];
  
  return (
    <div className="min-h-screen bg-dark-200 text-white">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-100 border-b border-gray-800 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <button onClick={() => navigate(-1)} className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">NFT Sammlung erstellen</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="container mx-auto px-4 py-6">
          <div className="hidden lg:flex items-center gap-2 mb-6">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
            </button>
            <h1 className="text-2xl font-bold">Neue NFT Sammlung erstellen</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Logo & Banner Upload */}
              <div className="lg:col-span-1">
                <Card className="bg-dark-100 border-gray-800 mb-6">
                  <CardHeader>
                    <CardTitle>Logo</CardTitle>
                    <CardDescription>
                      Lade ein Logo für deine Sammlung hoch
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 text-center ${
                        logoPreview ? 'border-primary-500' : 'border-gray-700'
                      } transition-colors mb-4`}
                    >
                      {logoPreview ? (
                        <div className="relative">
                          <img 
                            src={logoPreview} 
                            alt="Logo Preview" 
                            className="mx-auto max-h-40 rounded"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              setLogoImage(null);
                              setLogoPreview(null);
                            }}
                            className="absolute top-2 right-2 bg-dark-300/80 rounded-full p-1 text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-6">
                          <Upload className="h-10 w-10 mx-auto mb-4 text-gray-500" />
                          <p className="text-gray-400 mb-2">Klicke oder ziehe, um hochzuladen</p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG. Quadratisch für beste Ergebnisse.
                          </p>
                        </div>
                      )}
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className={`absolute inset-0 opacity-0 cursor-pointer ${logoPreview ? 'pointer-events-none' : ''}`}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-100 border-gray-800">
                  <CardHeader>
                    <CardTitle>Banner</CardTitle>
                    <CardDescription>
                      Lade ein Banner für deine Sammlung hoch (optional)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 text-center ${
                        bannerPreview ? 'border-primary-500' : 'border-gray-700'
                      } transition-colors mb-4`}
                    >
                      {bannerPreview ? (
                        <div className="relative">
                          <img 
                            src={bannerPreview} 
                            alt="Banner Preview" 
                            className="mx-auto w-full max-h-40 object-cover rounded"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              setBannerImage(null);
                              setBannerPreview(null);
                            }}
                            className="absolute top-2 right-2 bg-dark-300/80 rounded-full p-1 text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="py-6">
                          <Upload className="h-10 w-10 mx-auto mb-4 text-gray-500" />
                          <p className="text-gray-400 mb-2">Klicke oder ziehe, um hochzuladen</p>
                          <p className="text-xs text-gray-500">
                            Empfohlenes Format: 1500×500px
                          </p>
                        </div>
                      )}
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className={`absolute inset-0 opacity-0 cursor-pointer ${bannerPreview ? 'pointer-events-none' : ''}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Collection Details */}
              <div className="lg:col-span-2">
                <Card className="bg-dark-100 border-gray-800 mb-6">
                  <CardHeader>
                    <CardTitle>Sammlungsinformationen</CardTitle>
                    <CardDescription>
                      Details zu deiner NFT Sammlung
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name*</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-dark-300 border-gray-700"
                          placeholder="z.B. CryptoKittens"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="symbol">Symbol*</Label>
                        <Input
                          id="symbol"
                          value={symbol}
                          onChange={(e) => setSymbol(e.target.value)}
                          className="bg-dark-300 border-gray-700"
                          placeholder="z.B. KITY"
                          required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Ein kurzes Symbol für deine Sammlung (typischerweise 3-5 Buchstaben)
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Beschreibung</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="bg-dark-300 border-gray-700 min-h-24"
                          placeholder="Beschreibe deine Sammlung..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-100 border-gray-800 mb-6">
                  <CardHeader>
                    <CardTitle>Blockchain & Einstellungen</CardTitle>
                    <CardDescription>
                      Konfiguriere die Sammlung-Einstellungen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="network">Blockchain</Label>
                        <Select 
                          value={network} 
                          onValueChange={setNetwork}
                        >
                          <SelectTrigger className="bg-dark-300 border-gray-700">
                            <SelectValue placeholder="Wähle eine Blockchain" />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-300 border-gray-700">
                            <SelectItem value="Ethereum">Ethereum</SelectItem>
                            <SelectItem value="Polygon">Polygon</SelectItem>
                            <SelectItem value="BSN">BSN Chain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="royaltyFee">Lizenzgebühr (%)</Label>
                        <Input
                          id="royaltyFee"
                          type="number"
                          min="0"
                          max="15"
                          step="0.1"
                          value={royaltyFee}
                          onChange={(e) => setRoyaltyFee(e.target.value)}
                          className="bg-dark-300 border-gray-700"
                          placeholder="z.B. 2.5"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Prozentsatz, den du bei jedem Verkauf erhältst (0-15%)
                        </p>
                      </div>
                      
                      <div>
                        <Label>Kategorien</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {categoryOptions.map((option) => (
                            <Button
                              key={option.value}
                              type="button"
                              variant={categories.includes(option.value) ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => handleCategoryChange(option.value)}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                  >
                    Abbrechen
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !name || !symbol || !logoPreview}
                  >
                    {isLoading ? 'Wird erstellt...' : 'Sammlung erstellen'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateNFTCollection;
