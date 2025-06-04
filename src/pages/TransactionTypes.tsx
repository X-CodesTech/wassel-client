import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { FileText, Plus, Edit, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define transaction type interface
interface TransactionType {
  id: number;
  name: string;
  createdAt?: string;
}

// Form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Transaction name is required" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function TransactionTypes() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<TransactionType | null>(null);
  const { toast } = useToast();

  // Sample transaction types data (client-side)
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([
    { id: 1, name: "Sale", createdAt: new Date().toISOString() },
    { id: 2, name: "Purchase", createdAt: new Date().toISOString() },
    { id: 3, name: "Transfer", createdAt: new Date().toISOString() },
  ]);

  // Form for adding transaction type
  const addForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // Form for editing transaction type
  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedTransactionType?.name || "",
    },
  });

  // Reset edit form when selected transaction changes
  useEffect(() => {
    if (selectedTransactionType) {
      editForm.reset({
        name: selectedTransactionType.name,
      });
    }
  }, [selectedTransactionType, editForm]);

  // Handle add transaction type
  const handleAddTransactionType = (values: FormValues) => {
    // Generate a new ID
    const newId = Math.max(...transactionTypes.map((t) => t.id), 0) + 1;

    // Create new transaction type
    const newTransactionType: TransactionType = {
      id: newId,
      name: values.name,
      createdAt: new Date().toISOString(),
    };

    // Add to transaction types state
    setTransactionTypes([...transactionTypes, newTransactionType]);

    // Show success toast
    toast({
      title: "Success",
      description: "Transaction type added successfully",
    });

    // Close modal and reset form
    setAddModalOpen(false);
    addForm.reset();
  };

  // Handle edit transaction type
  const handleEditTransactionType = (values: FormValues) => {
    if (selectedTransactionType) {
      // Update the transaction type in the state
      setTransactionTypes(
        transactionTypes.map((transactionType) =>
          transactionType.id === selectedTransactionType.id
            ? { ...transactionType, name: values.name }
            : transactionType
        )
      );

      // Show success toast
      toast({
        title: "Success",
        description: "Transaction type updated successfully",
      });

      // Close modal and reset form
      setEditModalOpen(false);
      editForm.reset();
    }
  };

  // Handle delete transaction type
  const handleDeleteTransactionType = () => {
    if (selectedTransactionType) {
      // Remove the transaction type from state
      setTransactionTypes(
        transactionTypes.filter(
          (transactionType) => transactionType.id !== selectedTransactionType.id
        )
      );

      // Show success toast
      toast({
        title: "Success",
        description: "Transaction type deleted successfully",
      });

      // Close the delete dialog
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <title>Transaction Types | Wassel</title>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Transaction Types
          </h2>
          <p className="text-gray-500 mt-2">
            Configure and manage transaction types in the system
          </p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center"
          style={{
            backgroundColor: "#1e88e5",
            color: "white",
            border: "none",
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Transaction Type
        </Button>
      </div>

      {transactionTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
            <div className="rounded-full bg-blue-100 p-4 mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Transaction Types</h3>
            <p className="text-gray-500 max-w-md">
              You haven't added any transaction types yet. Click the "Add
              Transaction Type" button to create your first one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {transactionTypes.map((transactionType) => (
            <Card key={transactionType.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex justify-between items-center p-6">
                  <div>
                    <h3 className="text-lg font-medium">
                      {transactionType.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      ID: {transactionType.id}
                    </p>
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
            <form
              onSubmit={addForm.handleSubmit(handleAddTransactionType)}
              className="space-y-4"
            >
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
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
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
            <form
              onSubmit={editForm.handleSubmit(handleEditTransactionType)}
              className="space-y-4"
            >
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
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
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
              This will permanently delete the transaction type "
              {selectedTransactionType?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteTransactionType}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
