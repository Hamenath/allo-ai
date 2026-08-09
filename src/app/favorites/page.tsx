"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAIGenerations, deleteGeneration, toggleFavorite, AIGeneration } from "@/lib/db/generations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Trash2, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const data = await getAIGenerations(user.uid);
        // Filter locally to avoid requiring a composite Firestore index for the MVP
        setGenerations(data.filter(g => g.isFavorite));
      } catch (error) {
        console.error("Failed to load favorites", error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteGeneration(id);
      setGenerations(generations.filter(g => g.id !== id));
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await toggleFavorite(id, currentStatus);
      // Since this is the favorites page, unfavoriting should remove it from the view
      setGenerations(generations.filter(g => g.id !== id));
    } catch (error) {
      console.error("Failed to favorite", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
          <p className="text-muted-foreground mt-2">
            Your saved and favorited AI generations.
          </p>
        </div>
      </div>

      {generations.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">No favorites yet</h2>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm text-sm">
            You haven&apos;t saved any AI results to your favorites yet. Click the heart icon on any generated result to save it here.
          </p>
          <Link href="/dashboard">
            <Button>Explore Tools</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {generations.map((gen) => (
            <Card key={gen.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="mb-2">{gen.category}</Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleFavorite(gen.id as string, gen.isFavorite)}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
                <CardTitle className="text-xl">{gen.title || "AI Generation"}</CardTitle>
                <CardDescription>
                  {gen.createdAt?.toDate ? format(gen.createdAt.toDate(), 'MMM d, yyyy h:mm a') : 'Recently'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {/* A brief preview based on output type */}
                <div className="text-sm text-muted-foreground line-clamp-3 bg-muted/50 p-3 rounded-md">
                  {gen.output?.fullEmail || gen.output?.opening || gen.output?.variations?.[0]?.hook || gen.output?.overallStrategy || gen.output?.technicalQuestions?.[0]?.question || gen.output?.recommendations?.[0] || 'View full result'}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-4 border-t">
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(gen.id as string)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/tools/${gen.toolId}`}>
                    Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
