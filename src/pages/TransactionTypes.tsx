import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TransactionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileText, Plus, Edit, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Transaction name is required" })
});

type FormValues = z.infer<typeof formSchema>;

export default function TransactionTypes() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType | null>(null);
  const { toast } = useToast();

  // Fetch all transaction types
  const { data: transactionTypes = [], isLoading } = useQuery({
    queryKey: ['/api/transaction-types'],
    refetchOnWindowFocus: true
  });

  // Create transaction type mutation
  const createTransactionTypeMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiRequest("POST", "/api/transaction-types", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transaction-types'] });
      toast({
        title: "Success",
        description: "Transaction type created successfully",
      });
      setAddModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create transaction type: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Update transaction type mutation
  const updateTransactionTypeMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number, values: FormValues }) => {
      return apiRequest("PUT", `/api/transaction-types/${id}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transaction-types'] });
      toast({
        title: "Success",
        description: "Transaction type updated successfully",
      });
      setEditModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update transaction type: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Delete transaction type mutation
  const deleteTransactionTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/transaction-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transaction-types'] });
      toast({
        title: "Success",
        description: "Transaction type deleted successfully",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete transaction type: ${error}`,
        variant: "destructive"
      });
    }
  });

  // Form for adding transaction type
  const addForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ""
    }
  });

  // Form for editing transaction type
  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedTransactionType?.name || ""
    }
  });

  // Reset edit form when selected transaction changes
  useEffect(() => {
    if (selectedTransactionType) {
      editForm.reset({
        name: selectedTransactionType.name
      });
    }
  }, [selectedTransactionType, editForm]);

  // Handle add transaction type
  const handleAddTransactionType = (values: FormValues) => {
    createTransactionTypeMutation.mutate(values);
  };

  // Handle edit transaction type
  const handleEditTransactionType = (values: FormValues) => {
    if (selectedTransactionType) {
      updateTransactionTypeMutation.mutate({
        id: selectedTransactionType.id,
        values
      });
    }
  };

  // Handle delete transaction type
  const handleDeleteTransactionType = () => {
    if (selectedTransactionType) {
      deleteTransactionTypeMutation.mutate(selectedTransactionType.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transaction Types</h2>
          <p className="text-gray-500 mt-2">
            Configure and manage transaction types in the system
          </p>
        </div>
        <Button 
          onClick={() => setAddModalOpen(true)} 
          className="flex items-center"
          style={{ 
            backgroundColor: '#1e88e5', 
            color: 'white',
            border: 'none' 
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Transaction Type
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      ) : transactionTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Transaction Types</h3>
            <p className="text-gray-500 max-w-md">
              You haven't added any transaction types yet. Click the "Add Transaction Type" button to create your first one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {transactionTypes.map((transactionType: TransactionType) => (
            <Card key={transactionType.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex justify-between items-center p-6">
                  <div>
                    <h3 className="text-lg font-medium">{transactionType.name}</h3>
                    <p className="text-sm text-gray-500">ID: {transactionType.id}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedTransactionType(transactionType);
                        setEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        setSelectedTransactionType(transactionType);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Transaction Type Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction Type</DialogTitle>
            <DialogDescription>
              Enter the details for the new transaction type.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddTransactionType)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter transaction name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTransactionTypeMutation.isPending}>
                  {createTransactionTypeMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Type Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction Type</DialogTitle>
            <DialogDescription>
              Update the details for this transaction type.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditTransactionType)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter transaction name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTransactionTypeMutation.isPending}>
                  {updateTransactionTypeMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Type Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the transaction type "{selectedTransactionType?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteTransactionType}
              disabled={deleteTransactionTypeMutation.isPending}
            >
              {deleteTransactionTypeMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}