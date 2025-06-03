import { useState } from "react";
import { Order } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Package,
  Clock,
  User,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useLocation } from "wouter";

const sampleOrder = {
  id: 1,
  orderNumber: "RQU-03",
  status: "pending",
  createdDate: "13/3/2025",
  material: "National",
  assignedTo: "Negotiator",
  createdThrough: "One portal",
  service: "Freight",
  serviceNumber: "F18464",
  requesterName: "Mohammed Khaleal",
  requesterContact1: "059869001",
  requesterContact2: "059869112",
  requesterEmail: "majsoom@wassel.com",
  pickupLocation: "Palestine, Ramallah, Almasyoun",
  pickupAddress: "Wassel HQ",
  pickupTimeWindow: "10/3/2024 - 16/3/2024",
  pickupCoordinatorName: "Mohammed Khaleal",
  pickupCoordinatorContact1: "059869001",
  pickupCoordinatorContact2: "059869112",
  pickupCoordinatorEmail: "majsoom@wassel.com",
  deliveryLocation: "Palestine, Ramallah, Almasyoun",
  deliveryAddress: "Wassel HQ",
  deliveryTimeWindow: "10/3/2024 - 16/3/2024",
  deliveryCoordinatorName: "Mohammed Khaleal",
  deliveryCoordinatorContact1: "059869001",
  deliveryCoordinatorContact2: "059869112",
  deliveryCoordinatorEmail: "majsoom@wassel.com",
  serviceDetails: [
    "1 x Truck Lite_Dim_BG_Lit_Seeking Welding",
    "2 x Labor for Load",
    "3 x Labor for Unload",
  ],
  specialRequirements: [
    "1 x Forklift - Should be fully charged",
    "4 x Labor - Fuel day",
  ],
  sellingPrice: "25,000",
  cost: "1,000",
  profitMargin: "-96%",
  currency: "J.S",
  attachments: [
    {
      name: "13/3/2025 16:08:00",
      type: "Order",
      assigned: "mjsoom",
      date: "13/3/2025 16:08:00",
    },
    {
      name: "13/3/2025 16:08:00",
      type: "Order",
      assigned: "mjsoom",
      date: "13/3/2025 16:08:00",
    },
    {
      name: "13/3/2025 16:08:00",
      type: "Order",
      assigned: "mjsoom",
      date: "13/3/2025 16:08:00",
    },
  ],
};

export default function OrdersList() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header with Order Info and Actions */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold">Order info</h1>
            <h2 className="text-3xl font-bold text-blue-600">
              {sampleOrder.orderNumber}
            </h2>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>Created date: {sampleOrder.createdDate}</span>
              <span>Material: {sampleOrder.material}</span>
              <span>Assigned to: {sampleOrder.assignedTo}</span>
              <span>Service: {sampleOrder.service}</span>
            </div>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span>Created through: {sampleOrder.createdThrough}</span>
              <span>Service number: {sampleOrder.serviceNumber}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status and Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Pending
          </Badge>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="order"
              name="type"
              className="text-blue-600"
              defaultChecked
            />
            <label htmlFor="order" className="text-sm">
              Order
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge className="bg-purple-600 text-white">Waiting approval</Badge>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Post order
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Quick post
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Send by email
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Print order
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Required Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Required service details</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {sampleOrder.serviceDetails.map((detail, index) => (
                  <li key={index} className="text-sm">
                    {detail}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Service Details Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Freight</TableHead>
                    <TableHead>Requester Name</TableHead>
                    <TableHead>Mohammed Khaleal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Type of goods</TableCell>
                    <TableCell>Business and HI-VIs</TableCell>
                    <TableCell>Requester mobile number 1</TableCell>
                    <TableCell>{sampleOrder.requesterContact1}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Goods description</TableCell>
                    <TableCell>ELECTRONICS AND ELECTRICAL</TableCell>
                    <TableCell>Requester mobile number 2</TableCell>
                    <TableCell>{sampleOrder.requesterContact2}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Billing Amount</TableCell>
                    <TableCell>Jawaad company</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>{sampleOrder.requesterEmail}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pickup Point */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Pickup point 1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Pickup location:</strong>{" "}
                    {sampleOrder.pickupLocation}
                  </p>
                  <p>
                    <strong>Pickup address:</strong> {sampleOrder.pickupAddress}
                  </p>
                  <p>
                    <strong>Pickup time window:</strong>{" "}
                    {sampleOrder.pickupTimeWindow}
                  </p>
                  <p>
                    <strong>Pickup notes:</strong>
                  </p>
                  <p>
                    <strong>Special requirements:</strong>
                  </p>
                  <ul className="ml-4">
                    {sampleOrder.specialRequirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p>
                    <strong>Pickup coordinator name:</strong>{" "}
                    {sampleOrder.pickupCoordinatorName}
                  </p>
                  <p>
                    <strong>Pickup coordinator mobile 1:</strong>{" "}
                    {sampleOrder.pickupCoordinatorContact1}
                  </p>
                  <p>
                    <strong>Pickup coordinator mobile 2:</strong>{" "}
                    {sampleOrder.pickupCoordinatorContact2}
                  </p>
                  <p>
                    <strong>Email:</strong> {sampleOrder.pickupCoordinatorEmail}
                  </p>
                  <p>
                    <strong>Other requirements:</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Point */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Delivery point 1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Pickup location:</strong>{" "}
                    {sampleOrder.deliveryLocation}
                  </p>
                  <p>
                    <strong>Pickup address:</strong>{" "}
                    {sampleOrder.deliveryAddress}
                  </p>
                  <p>
                    <strong>Pickup time window:</strong>{" "}
                    {sampleOrder.deliveryTimeWindow}
                  </p>
                  <p>
                    <strong>Pickup notes:</strong>
                  </p>
                  <p>
                    <strong>Special requirements:</strong>
                  </p>
                  <ul className="ml-4">
                    {sampleOrder.specialRequirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p>
                    <strong>Pickup coordinator name:</strong>{" "}
                    {sampleOrder.deliveryCoordinatorName}
                  </p>
                  <p>
                    <strong>Pickup coordinator mobile 1:</strong>{" "}
                    {sampleOrder.deliveryCoordinatorContact1}
                  </p>
                  <p>
                    <strong>Pickup coordinator mobile 2:</strong>{" "}
                    {sampleOrder.deliveryCoordinatorContact2}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {sampleOrder.deliveryCoordinatorEmail}
                  </p>
                  <p>
                    <strong>Other requirements:</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Initial Price Offer */}
          <Card>
            <CardHeader>
              <CardTitle>Initial price offer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-600 text-white p-4 rounded-lg mb-4">
                <h3 className="font-bold text-lg">ROU00000031POV3</h3>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-blue-600">
                    Transportation
                  </Button>
                  <Button size="sm" className="bg-blue-600">
                    Packaging
                  </Button>
                  <Button size="sm" className="bg-blue-600">
                    Warehouse
                  </Button>
                  <Button size="sm" className="bg-green-600">
                    Send by email
                  </Button>
                  <Button size="sm" className="bg-blue-600">
                    Print offer
                  </Button>
                </div>

                {/* Price table representation */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-3 border-b">
                    <div className="grid grid-cols-7 gap-4 text-sm font-medium">
                      <span>SL Start</span>
                      <span>Transportation</span>
                      <span>T</span>
                      <span>Transportation to KIA HAMTOUR</span>
                      <span>2,000</span>
                      <span>J.S</span>
                      <span>Action</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-7 gap-4 text-sm">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span>T: 45 KM RETURN</span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Initial Price Offer Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Initial price offer summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Selling price:</strong> {sampleOrder.sellingPrice}{" "}
                    {sampleOrder.currency}
                  </p>
                  <p>
                    <strong>Cost:</strong> {sampleOrder.cost}{" "}
                    {sampleOrder.currency}
                  </p>
                  <p>
                    <strong>Profit margin:</strong> {sampleOrder.profitMargin}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Update price manual:</strong>
                  </p>
                  <p>
                    <strong>Update cost:</strong>
                  </p>
                  <p>
                    <strong>Timeline:</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleOrder.attachments.map((attachment, index) => (
                    <TableRow key={index}>
                      <TableCell>{attachment.name}</TableCell>
                      <TableCell>{attachment.type}</TableCell>
                      <TableCell>{attachment.assigned}</TableCell>
                      <TableCell>{attachment.date}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4">
                <Button className="bg-gray-500 hover:bg-gray-600">
                  Browse...
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - would contain additional info */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center text-sm text-gray-600">
                Additional order information and actions would go here
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
