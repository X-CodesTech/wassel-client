import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Edit, Trash, ArrowLeft, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import {
  actGetPriceListById,
  actDeletePriceList,
  clearError,
  clearSelectedPriceList,
} from "@/store/priceLists";
import { useToast } from "@/hooks/use-toast";
import { PriceList } from "@/services/priceListServices";

export default function PriceListDetails() {
  const [match, params] = useRoute<{ id: string }>("/price-lists/:id");
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    selectedPriceList: priceList,
    loading,
    error,
  } = useAppSelector((state) => state.priceLists);

  // Fetch price list data when component mounts
  useEffect(() => {
    if (match && params?.id) {
      dispatch(actGetPriceListById(params.id));
    }
  }, [match, params?.id, dispatch]);

  // Clear error and selected price list when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSelectedPriceList());
    };
  }, [dispatch]);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  const handleDelete = async () => {
    if (priceList?._id) {
      try {
        await dispatch(actDeletePriceList(priceList._id)).unwrap();
        setDeleteDialogOpen(false);
        toast({
          title: "Price List Deleted",
          description: `"${priceList.name}" has been deleted successfully.`,
        });
        setLocation("/price-lists");
      } catch (error) {
        console.error("Failed to delete price list:", error);
      }
    }
  };

  const handleEdit = () => {
    // For now, we'll just show a toast message
    // In the future, this could navigate to an edit page
    toast({
      title: "Edit Feature",
      description: "Edit functionality will be implemented soon.",
    });
  };

  const handleBack = () => {
    setLocation("/price-lists");
  };

  // Get sub-activity name by ID
  const getSubActivityName = (subActivity: any) => {
    if (typeof subActivity === "string") {
      return "Unknown Activity";
    }
    return subActivity.portalItemNameEn || "Unknown Activity";
  };

  if (loading && !priceList) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading price list details...</span>
        </div>
      </div>
    );
  }

  if (!priceList) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Price List Not Found</h3>
          <p className="text-gray-500 mb-4">
            The price list you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Price Lists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <title>Price List Details | Wassel</title>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={handleBack} className="p-1 mr-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {priceList.name}
          </h2>
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
              Effective from{" "}
              {new Date(priceList.effectiveFrom).toLocaleDateString()} to{" "}
              {new Date(priceList.effectiveTo).toLocaleDateString()}
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
          {priceList.subActivityPrices.length === 0 ? (
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
                  <TableHead>Pricing Method</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceList.subActivityPrices.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {getSubActivityName(item.subActivity)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {item.pricingMethod.replace(/([A-Z])/g, " $1").trim()}
                    </TableCell>
                    <TableCell>
                      ${item.basePrice?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>${item.cost?.toFixed(2)}</TableCell>
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
