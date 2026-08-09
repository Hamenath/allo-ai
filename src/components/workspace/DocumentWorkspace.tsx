"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAIGenerations, deleteGeneration, toggleFavorite, updateGeneration, AIGeneration } from "@/lib/db/generations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Loader2, Trash2, Heart, Search, Edit3, Save, Copy } from "lucide-react";
import { format } from "date-fns";

interface DocumentWorkspaceProps {
  title: string;
  description: string;
  onlyFavorites?: boolean;
}

export function DocumentWorkspace({ title, description, onlyFavorites = false }: DocumentWorkspaceProps) {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedDoc, setSelectedDoc] = useState<AIGeneration | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = 12;

  const loadDocuments = async (isInitial = true) => {
    if (!user) return;
    if (isInitial) {
      setLoading(true);
      setHasMore(true);
      setGenerations([]);
      setLastDoc(null);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const { docs, lastDoc: newLastDoc } = await getAIGenerations(user.uid, { 
        category: categoryFilter !== "ALL" ? categoryFilter : undefined,
        isFavorite: onlyFavorites ? true : undefined,
        limitCount: pageSize,
        lastDoc: isInitial ? undefined : lastDoc,
      });
      
      if (docs.length < pageSize) {
        setHasMore(false);
      }
      
      setLastDoc(newLastDoc);
      setGenerations(prev => isInitial ? docs : [...prev, ...docs]);
    } catch (error) {
      console.error("Failed to load documents", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadDocuments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, categoryFilter, onlyFavorites]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteGeneration(id);
      setGenerations(generations.filter(g => g.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleFavorite = async (id: string, currentStatus: boolean) => {
    try {
      await toggleFavorite(id, currentStatus);
      if (onlyFavorites && currentStatus) {
        // If we are un-favoriting on the favorites page, remove it from the list
        setGenerations(generations.filter(g => g.id !== id));
        if (selectedDoc?.id === id) setSelectedDoc(null);
      } else {
        setGenerations(generations.map(g => g.id === id ? { ...g, isFavorite: !currentStatus } : g));
        if (selectedDoc?.id === id) setSelectedDoc({ ...selectedDoc, isFavorite: !currentStatus });
      }
    } catch (error) {
      console.error("Failed to favorite", error);
    }
  };

  const handleRename = async () => {
    if (!selectedDoc || !selectedDoc.id || !newTitle.trim()) return;
    try {
      await updateGeneration(selectedDoc.id, { title: newTitle });
      setGenerations(generations.map(g => g.id === selectedDoc.id ? { ...g, title: newTitle } : g));
      setSelectedDoc({ ...selectedDoc, title: newTitle });
      setIsRenaming(false);
    } catch (error) {
      console.error("Failed to rename", error);
    }
  };

  const copyDocContent = () => {
    if (!selectedDoc) return;
    navigator.clipboard.writeText(JSON.stringify(selectedDoc.output, null, 2));
  };

  // Filter in memory for search term
  const filteredDocs = generations.filter(doc => 
    (doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.toolId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2">
            {description}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search documents..." 
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="CAREER">Career</SelectItem>
              <SelectItem value="BUSINESS">Business</SelectItem>
              <SelectItem value="DEVELOPER">Developer</SelectItem>
              <SelectItem value="PRODUCTIVITY">Productivity</SelectItem>
              <SelectItem value="LEARNING">Learning</SelectItem>
              <SelectItem value="CONTENT">Content</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : generations.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed p-12 text-center h-[40vh]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {onlyFavorites ? <Heart className="h-8 w-8 text-primary" /> : <FileText className="h-8 w-8 text-primary" />}
          </div>
          <h2 className="text-xl font-semibold">{onlyFavorites ? "No favorites yet" : "No documents found"}</h2>
          <p className="text-muted-foreground mt-2">
            {onlyFavorites ? "Click the heart icon on any document to save it here." : "Try adjusting your search or filters, or generate new content."}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((doc) => (
              <Card key={doc.id} className="flex flex-col hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{doc.category}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavorite(doc.id as string, doc.isFavorite);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${doc.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  <CardTitle className="text-lg line-clamp-1">{doc.title || "Untitled Document"}</CardTitle>
                  <CardDescription className="flex justify-between items-center">
                    <span>{doc.toolId}</span>
                    <span>{doc.createdAt?.toDate ? format(doc.createdAt.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-sm text-muted-foreground line-clamp-3 bg-muted/30 p-3 rounded-md min-h-[60px]">
                    {doc.output?.fullEmail || doc.output?.opening || doc.output?.variations?.[0]?.hook || doc.output?.overallStrategy || doc.output?.summary || doc.output?.markdown || 'View full document'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {hasMore && !searchTerm && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={() => loadDocuments(false)} disabled={loadingMore}>
                {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</> : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Reusable Document Viewer/Editor Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => {
        if (!open) {
          setSelectedDoc(null);
          setIsRenaming(false);
        }
      }}>
        {selectedDoc && (
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 border-b bg-muted/10 shrink-0">
              <div className="flex items-center justify-between pr-8">
                {isRenaming ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <Input 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)} 
                      className="text-lg font-bold" 
                      autoFocus
                    />
                    <Button size="sm" onClick={handleRename}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsRenaming(false)}>Cancel</Button>
                  </div>
                ) : (
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2 group">
                    {selectedDoc.title}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => {
                        setNewTitle(selectedDoc.title);
                        setIsRenaming(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </DialogTitle>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge>{selectedDoc.category}</Badge>
                <span className="text-sm text-muted-foreground">• {selectedDoc.toolId}</span>
                <span className="text-sm text-muted-foreground">• {selectedDoc.createdAt?.toDate ? format(selectedDoc.createdAt.toDate(), 'PPP') : 'Recently'}</span>
              </div>
            </DialogHeader>
            
            <div className="p-6 overflow-auto flex-1 bg-muted/5">
              <div className="space-y-4">
                {/* Generic viewer: render JSON intelligently */}
                {Object.entries(selectedDoc.output || {}).map(([key, val]) => (
                  <div key={key} className="bg-background p-4 rounded-lg border">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    {typeof val === 'string' ? (
                      <div className="whitespace-pre-wrap text-sm">{val}</div>
                    ) : Array.isArray(val) ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {val.map((item, i) => (
                          <li key={i}>
                            {typeof item === 'string' ? item : JSON.stringify(item)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(val, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <DialogFooter className="p-4 border-t bg-muted/10 shrink-0 flex items-center justify-between sm:justify-between w-full">
              <Button variant="destructive" onClick={() => handleDelete(selectedDoc.id as string)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleFavorite(selectedDoc.id as string, selectedDoc.isFavorite)}>
                  <Heart className={`h-4 w-4 mr-2 ${selectedDoc.isFavorite ? 'fill-red-500 text-red-500' : ''}`} /> 
                  {selectedDoc.isFavorite ? 'Saved' : 'Favorite'}
                </Button>
                <Button variant="outline" onClick={copyDocContent}>
                  <Copy className="h-4 w-4 mr-2" /> Copy Data
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
