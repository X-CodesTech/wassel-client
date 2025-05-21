import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react";

// Define location interface and schema
interface Location {
    id: number;
    country: string;
    area: string;
    city: string;
    village: string;
}

const locationSchema = z.object({
    country: z.string().min(1, "Country is required"),
    area: z.string().min(1, "Area is required"),
    city: z.string().min(1, "City is required"),
    village: z.string().min(1, "Village is required"),
});

type LocationFormValues = z.infer<typeof locationSchema>;

// Main component
export default function LocationManagement() {
    const { toast } = useToast();

    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    // Sample location data
    const [locations, setLocations] = useState<Location[]>([
        {
            id: 1,
            country: "United States",
            area: "California",
            city: "San Francisco",
            village: "Mission District"
        },
        {
            id: 2,
            country: "United States",
            area: "New York",
            city: "New York City",
            village: "Manhattan"
        },
        {
            id: 3,
            country: "United Kingdom",
            area: "England",
            city: "London",
            village: "Westminster"
        },
        {
            id: 4,
            country: "Canada",
            area: "Ontario",
            city: "Toronto",
            village: "Downtown"
        },
        {
            id: 5,
            country: "Australia",
            area: "New South Wales",
            city: "Sydney",
            village: "The Rocks"
        }
    ]);

    // Set up form
    const form = useForm<LocationFormValues>({
        resolver: zodResolver(locationSchema),
        defaultValues: {
            country: "",
            area: "",
            city: "",
            village: ""
        }
    });

    // Add a new location
    const addLocation = (values: LocationFormValues) => {
        // Generate a new ID
        const newId = Math.max(...locations.map(loc => loc.id), 0) + 1;

        // Create new location
        const newLocation: Location = {
            ...values,
            id: newId
        };

        // Add to locations state
        setLocations([...locations, newLocation]);

        // Show success toast
        toast({
            title: "Success",
            description: "Location added successfully",
        });

        // Close modal and reset form
        setIsAddDialogOpen(false);
        form.reset();
    };

    // Update an existing location
    const updateLocation = (values: LocationFormValues & { id: number }) => {
        const { id, ...updateData } = values;

        // Update the location in the state
        setLocations(locations.map(location =>
            location.id === id
                ? { ...location, ...updateData }
                : location
        ));

        // Show success toast
        toast({
            title: "Success",
            description: "Location updated successfully",
        });

        // Close modal and reset form
        setIsEditDialogOpen(false);
        form.reset();
    };

    // Delete a location
    const deleteLocation = (id: number) => {
        // Remove the location from state
        setLocations(locations.filter(location => location.id !== id));

        // Show success toast
        toast({
            title: "Success",
            description: "Location deleted successfully",
        });

        // Close the delete dialog
        setIsDeleteDialogOpen(false);
    };

    // Form submission handler
    const onSubmit = (values: LocationFormValues) => {
        if (isEditDialogOpen && selectedLocation) {
            updateLocation({ ...values, id: selectedLocation.id });
        } else {
            addLocation(values);
        }
    };

    // Edit button handler
    const handleEdit = (location: Location) => {
        setSelectedLocation(location);
        form.reset({
            country: location.country,
            area: location.area,
            city: location.city,
            village: location.village,
        });
        setIsEditDialogOpen(true);
    };

    // Delete button handler
    const handleDelete = (location: Location) => {
        setSelectedLocation(location);
        setIsDeleteDialogOpen(true);
    };

    // Confirm delete handler
    const confirmDelete = () => {
        if (selectedLocation) {
            deleteLocation(selectedLocation.id);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Location Management</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            Add Location
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Location</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter country name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="area"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Area</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter area name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter city name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="village"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Village</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter village name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        Save Location
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Country</TableHead>
                                <TableHead>Area</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>Village</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {locations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No locations found. Click 'Add Location' to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                locations.map((location) => (
                                    <TableRow key={location.id}>
                                        <TableCell>{location.country}</TableCell>
                                        <TableCell>{location.area}</TableCell>
                                        <TableCell>{location.city}</TableCell>
                                        <TableCell>{location.village}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(location)}
                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(location)}
                                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Location Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Location</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter country name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Area</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter area name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter city name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="village"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Village</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter village name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    Update Location
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete this location?</p>
                        {selectedLocation && (
                            <p className="text-sm text-gray-500 mt-2">
                                {`${selectedLocation.country} > ${selectedLocation.area} > ${selectedLocation.city} > ${selectedLocation.village}`}
                            </p>
                        )}
                        <p className="text-sm text-red-500 mt-2">This action cannot be undone.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}