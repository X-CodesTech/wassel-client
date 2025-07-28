import React, { useState } from "react";
import AttachmentModule from "@/components/AttachmentModule";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ContextType = "Vendor" | "Customer" | "Order";

const AttachmentDemo: React.FC = () => {
  const [selectedContext, setSelectedContext] =
    useState<ContextType>("Customer");
  const [contextId, setContextId] = useState<string>("CUST001");

  const getContextId = (context: ContextType): string => {
    switch (context) {
      case "Customer":
        return "CUST001";
      case "Vendor":
        return "VEND001";
      case "Order":
        return "65e1c2a4f1b2c3d4e5f6a7b8";
      default:
        return "CUST001";
    }
  };

  const handleContextChange = (context: ContextType) => {
    setSelectedContext(context);
    setContextId(getContextId(context));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Attachment Management System
        </h1>
        <p className="text-gray-600">
          This page demonstrates the context-aware AttachmentModule component
          that dynamically uses different endpoints based on the context type
          (Customer, Vendor, Order).
        </p>
      </div>

      {/* Context Selector */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Context Selector
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Select Context:</span>
          <div className="flex gap-2">
            <Button
              variant={selectedContext === "Customer" ? "default" : "outline"}
              size="sm"
              onClick={() => handleContextChange("Customer")}
            >
              Customer
            </Button>
            <Button
              variant={selectedContext === "Vendor" ? "default" : "outline"}
              size="sm"
              onClick={() => handleContextChange("Vendor")}
            >
              Vendor
            </Button>
            <Button
              variant={selectedContext === "Order" ? "default" : "outline"}
              size="sm"
              onClick={() => handleContextChange("Order")}
            >
              Order
            </Button>
          </div>
          <Badge className="ml-4">Current ID: {contextId}</Badge>
        </div>
      </div>

      {/* Attachment Module */}
      <div className="max-w-7xl">
        <AttachmentModule
          contextType={selectedContext}
          contextId={contextId}
          title={`${selectedContext} File Management`}
        />
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">
          Context-Aware Features
        </h2>
        <ul className="space-y-2 text-blue-800">
          <li>
            • <strong>Dynamic Endpoints:</strong> Automatically uses the correct
            API endpoints based on context
          </li>
          <li>
            • <strong>Context-Specific Data:</strong> Loads and displays data
            relevant to the selected context
          </li>
          <li>
            • <strong>Visual Indicators:</strong> Color-coded badges and headers
            for each context type
          </li>
          <li>
            • <strong>Context-Specific Operations:</strong> Upload, download,
            and delete operations work with the correct context
          </li>
          <li>
            • <strong>Real-time Updates:</strong> Data refreshes when context
            changes
          </li>
          <li>
            • <strong>Error Handling:</strong> Context-specific error messages
            and loading states
          </li>
        </ul>
      </div>

      <div className="mt-6 p-6 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold text-green-900 mb-3">
          API Endpoints by Context
        </h2>
        <div className="space-y-4 text-green-800">
          <div>
            <h3 className="font-medium text-green-900">Customer Context:</h3>
            <ul className="text-sm space-y-1 ml-4">
              <li>• GET /uploads/customers/{contextId}/files</li>
              <li>• POST /uploads/customers/{contextId}/upload</li>
              <li>
                • DELETE /uploads/customers/{contextId}/files/{"{fileName}"}
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-green-900">Vendor Context:</h3>
            <ul className="text-sm space-y-1 ml-4">
              <li>• GET /uploads/vendors/{contextId}/files</li>
              <li>• POST /uploads/vendors/{contextId}/upload</li>
              <li>
                • DELETE /uploads/vendors/{contextId}/files/{"{fileName}"}
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-green-900">Order Context:</h3>
            <ul className="text-sm space-y-1 ml-4">
              <li>• GET /uploads/orders/{contextId}/files</li>
              <li>• POST /uploads/orders/{contextId}/upload</li>
              <li>
                • DELETE /uploads/orders/{contextId}/files/{"{fileName}"}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 bg-purple-50 rounded-lg">
        <h2 className="text-xl font-semibold text-purple-900 mb-3">
          Usage Examples
        </h2>
        <div className="space-y-3 text-purple-800">
          <div>
            <h3 className="font-medium text-purple-900">
              Customer Attachments:
            </h3>
            <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
              {`<AttachmentModule
  contextType="Customer"
  contextId="CUST001"
  title="Customer File Management"
/>`}
            </pre>
          </div>
          <div>
            <h3 className="font-medium text-purple-900">Vendor Attachments:</h3>
            <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
              {`<AttachmentModule
  contextType="Vendor"
  contextId="VEND001"
  title="Vendor File Management"
/>`}
            </pre>
          </div>
          <div>
            <h3 className="font-medium text-purple-900">Order Attachments:</h3>
            <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
              {`<AttachmentModule
  contextType="Order"
  contextId="65e1c2a4f1b2c3d4e5f6a7b8"
  title="Order File Management"
/>`}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 bg-orange-50 rounded-lg">
        <h2 className="text-xl font-semibold text-orange-900 mb-3">
          Component Props
        </h2>
        <div className="space-y-2 text-orange-800">
          <div>
            <strong>contextType:</strong> "Vendor" | "Customer" | "Order" -
            Determines which API endpoints to use
          </div>
          <div>
            <strong>contextId:</strong> string - The ID for the specific context
            (custAccount, vendAccount, or orderId)
          </div>
          <div>
            <strong>title:</strong> string (optional) - Custom title for the
            component header
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentDemo;
