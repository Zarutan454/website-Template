import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNFTs } from '@/hooks/useNFTs';
// import { useNFTCollections } from '@/hooks/useNFTCollections';
import { NFTCollection } from '@/types/nft';
import { NFTAttribute } from '@/types/token';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Upload, ArrowLeft } from "lucide-react";
import { toast } from 'sonner';

const CreateNFT = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collections: fetchedCollections, createNFT, isLoading } = useNFTs();
  // const { collections: userCollections, fetchUserCollections, isLoading: collectionsLoading } = useNFTCollections();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [network, setNetwork] = useState('Ethereum');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<NFTAttribute[]>([
    { trait_type: '', value: '' }
  ]);
  
  useEffect(() => {
    // fetchUserCollections();
    
    if (location.state?.collectionId) {
      setCollectionId(location.state.collectionId);
    }
  }, [location.state]);
  
  const allCollections = [...fetchedCollections, ...userCollections.filter(
    uc => !fetchedCollections.some(fc => fc.id === uc.id)
  )];
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  
  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };
  
  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };
  
  const updateAttribute = (index: number, key: keyof NFTAttribute, value: string) => {
    const newAttributes = [...attributes];
    newAttributes[index] = { ...newAttributes[index], [key]: value };
    setAttributes(newAttributes);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a name for your NFT');
      return;
    }
    
    if (!imageFile) {
      toast.error('Please upload an image for your NFT');
      return;
    }
    
    if (!collectionId) {
      toast.error('Please select a collection');
      return;
    }
    
    try {
      const filteredAttributes = attributes.filter(
        attr => attr.trait_type.trim() !== '' && attr.value.toString().trim() !== ''
      );
      
      const nftData = {
        name,
        description,
        collectionId,
        network,
        imageUrl: imagePreview || '',
        attributes: filteredAttributes,
      };
      
      const newNFT = await createNFT(nftData);
      
      toast.success('NFT created successfully!');
      navigate(`/nft/${newNFT.id}`);
    } catch (error) {
      toast.error('Failed to create NFT');
    }
  };
  
  return (
    <div className="min-h-screen bg-dark-200 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-100 border-b border-gray-800 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <button onClick={() => navigate(-1)} className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Create NFT</h1>
          </div>
        </div>
      </header>

      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="container mx-auto px-4 py-6">
          <div className="hidden lg:flex items-center gap-2 mb-6">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </button>
            <h1 className="text-2xl font-bold">Create New NFT</h1>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="bg-dark-100 border-gray-800">
                  <CardHeader>
                    <CardTitle>NFT Image</CardTitle>
                    <CardDescription>
                      Upload the artwork for your NFT
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div 
                        className={`border-2 border-dashed rounded-lg p-4 text-center ${
                          imagePreview ? 'border-primary-500' : 'border-gray-700'
                        } transition-colors`}
                      >
                        {imagePreview ? (
                          <div className="relative">
                            <img 
                              src={imagePreview} 
                              alt="NFT Preview" 
                              className="mx-auto max-h-64 rounded"
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                              className="absolute top-2 right-2 bg-dark-300/80 rounded-full p-1 text-white"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="py-8">
                            <Upload className="h-10 w-10 mx-auto mb-4 text-gray-500" />
                            <p className="text-gray-400 mb-2">Click or drag to upload</p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF, SVG. Max 10MB.
                            </p>
                          </div>
                        )}
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className={`absolute inset-0 opacity-0 cursor-pointer ${imagePreview ? 'pointer-events-none' : ''}`}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="collection">Collection</Label>
                        <Select 
                          value={collectionId} 
                          onValueChange={setCollectionId}
                        >
                          <SelectTrigger className="bg-dark-300 border-gray-700">
                            <SelectValue placeholder="Select a collection" />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-300 border-gray-700">
                            {allCollections.map((collection) => (
                              <SelectItem key={collection.id} value={collection.id}>
                                {collection.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => navigate('/create-nft-collection')}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Create New Collection
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="network">Blockchain</Label>
                        <Select 
                          value={network} 
                          onValueChange={setNetwork}
                        >
                          <SelectTrigger className="bg-dark-300 border-gray-700">
                            <SelectValue placeholder="Select a blockchain" />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-300 border-gray-700">
                            <SelectItem value="Ethereum">Ethereum</SelectItem>
                            <SelectItem value="Polygon">Polygon</SelectItem>
                            <SelectItem value="BSN">BSN Chain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <Card className="bg-dark-100 border-gray-800 mb-6">
                  <CardHeader>
                    <CardTitle>Basic Info</CardTitle>
                    <CardDescription>
                      Name and describe your NFT
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
                          placeholder="e.g., Cosmic Dreamscape #1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="bg-dark-300 border-gray-700 min-h-24"
                          placeholder="Describe your NFT, its story, or what makes it special"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-100 border-gray-800 mb-6">
                  <CardHeader>
                    <CardTitle>Attributes</CardTitle>
                    <CardDescription>
                      Define properties and traits for your NFT
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {attributes.map((attr, index) => (
                        <div key={index} className="flex gap-3 items-start">
                          <div className="flex-1">
                            <Input
                              value={attr.trait_type}
                              onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                              className="bg-dark-300 border-gray-700 mb-2"
                              placeholder="Property name (e.g., Color)"
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              value={attr.value.toString()}
                              onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                              className="bg-dark-300 border-gray-700 mb-2"
                              placeholder="Value (e.g., Blue)"
                            />
                          </div>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeAttribute(index)}
                            className="mt-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addAttribute}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Attribute
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !name || !imageFile || !collectionId}
                  >
                    {isLoading ? 'Creating...' : 'Create NFT'}
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

export default CreateNFT;
