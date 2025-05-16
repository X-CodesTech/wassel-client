import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Edit, Trash, ArrowLeft } from "lucide-react";

interface PriceListItem {
  id: number;
  subActivityId: number;
  subActivityName: string;
  price: number;
}

interface PriceList {
  id: number;
  name: string;
  description: string;
  items: PriceListItem[];
  createdAt: Date;
}

export default function PriceListDetails() {
  const [match, params] = useRoute<{ id: string }>("/price-lists/:id");
  const [, setLocation] = useLocation();
  const [priceList, setPriceList] = useState<PriceList | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // In a real application, we would fetch the price list from the server
  // For now, we'll use localStorage to retrieve our saved price lists
  useEffect(() => {
    if (match && params.id) {
      const id = parseInt(params.id);
      const storedPriceLists = localStorage.getItem('priceLists');
      let redirectToList = false;
      
      if (storedPriceLists) {
        try {
          const priceLists: PriceList[] = JSON.parse(storedPriceLists);
          const found = priceLists.find(pl => pl.id === id);
          
          if (found) {
            setPriceList(found);
          } else {
            // Price list not found
            redirectToList = true;
          }
        } catch (e) {
          // Error parsing data
          redirectToList = true;
        }
      } else {
        // No price lists in storage
        redirectToList = true;
      }
      
      if (redirectToList) {
        // We'll redirect outside the main logic to avoid potential loop
        const timer = setTimeout(() => setLocation("/price-lists?tab=price-lists"), 0);
        return () => clearTimeout(timer);
      }
    }
  }, [match, params && params.id]);

  const handleDelete = () => {
    if (priceList) {
      // Get current price lists
      const storedPriceLists = localStorage.getItem('priceLists');
      
      if (storedPriceLists) {
        let priceLists: PriceList[] = JSON.parse(storedPriceLists);
        // Filter out the current price list
        priceLists = priceLists.filter(pl => pl.id !== priceList.id);
        // Save updated list
        localStorage.setItem('priceLists', JSON.stringify(priceLists));
      }
      
      // Navigate back to price lists with tab preserved
      setLocation("/price-lists?tab=price-lists");
    }
    
    setDeleteDialogOpen(false);
  };

  const handleEdit = () => {
    // Navigate to edit page (we would implement this later)
    setLocation(`/price-lists/edit/${priceList?.id}`);
  };

  const handleBack = () => {
    // Preserve the tab state by going back to price lists with tab parameter
    setLocation("/price-lists?tab=price-lists");
  };

  if (!priceList) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={handleBack} className="p-1 mr-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{priceList.name}</h2>
          <p className="text-gray-500 mt-1">{priceList.description}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-blue-100 p-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Price List Details</h3>
            <p className="text-sm text-gray-500">
              Created on {new Date(priceList.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-red-500 hover:text-red-600"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items in this Price List</CardTitle>
          <CardDescription>
            These are the items and their prices included in this price list
          </CardDescription>
        </CardHeader>
        <CardContent>
          {priceList.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-3">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium mb-1">No Items</h4>
              <p className="text-gray-500 max-w-md">
                This price list doesn't have any items yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableCaption>List of items in this price list</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceList.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.subActivityName}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the price list "{priceList.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}