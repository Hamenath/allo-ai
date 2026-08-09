"use client";

import { DocumentWorkspace } from "@/components/workspace/DocumentWorkspace";

export default function FavoritesPage() {
  return (
    <DocumentWorkspace 
      title="Favorites" 
      description="Your saved and starred content for quick access." 
      onlyFavorites={true}
    />
  );
}
