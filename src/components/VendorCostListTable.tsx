import { useAppSelector } from "@/hooks/useAppSelector";
import {
  Location,
  LocationPrice,
  SubActivityPrice,
} from "@/services/vendorServices";
import { PRICING_METHOD_OPTIONS } from "@/utils/constants";
import { ChevronDownIcon, ChevronUpIcon, Edit, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import EditPriceCostListDialog from "./vendorPriceList/EditPriceCostList/EditPriceCostListDialog";
import DeletePriceCostListDialog from "./vendorPriceList/DeletePriceCostListDialog";

const renderCostRange = (
  cost: number | undefined,
  locationPrices: LocationPrice[]
) => {
  if (cost) {
    return cost.toLocaleString();
  }
  if (locationPrices.length > 0) {
    const min = Math.min(...locationPrices.map((item) => item.cost));
    const max = Math.max(...locationPrices.map((item) => item.cost));
    return `${min.toLocaleString()}-${max.toLocaleString()}`;
  }
  return "N/A";
};

const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case "Import":
      return "bg-orange-100 text-orange-800";
    case "Export":
      return "bg-red-100 text-red-800";
    case "Domestic":
      return "bg-yellow-100 text-yellow-800";
    case "Cross-Border":
      return "bg-indigo-100 text-indigo-800";
    case "Transit":
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPricingMethodColor = (method: string) => {
  switch (method) {
    case "perTrip":
      return "bg-blue-100 text-blue-800";
    case "perLocation":
      return "bg-green-100 text-green-800";
    case "perItem":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function VendorCostListTable() {
  const { priceLists } = useAppSelector((state) => state.vendors);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedSubActivityPrice, setSelectedSubActivityPrice] =
    useState<SubActivityPrice | null>(null);

  const [dialog, setDialog] = useState<"delete" | "edit" | null>(null);

  const loopItems = priceLists?.[0]?.subActivityPrices;

  const EXPANDABLE_ROWS = ["perLocation", "perTrip"];

  const MAIN_TABLE_HEADERS = [
    {
      label: "Service",
      key: "subActivity.portalItemNameEn",
    },
    {
      label: "Activity",
      key: "subActivity.activity.activityNameEn",
    },
    {
      label: "Transaction Type",
      key: "subActivity.transactionType.name",
    },
    {
      label: "Pricing Method",
      key: "subActivity.pricingMethod",
    },
    {
      label: "Cost Range",
      key: "subActivity.cost",
    },
    {
      label: "Actions",
      key: "action",
    },
  ];

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const renderExpandableContent = (item: SubActivityPrice) => {
    if (!expandedRows.has(item.subActivity.portalItemNameEn)) {
      return null;
    }

    const formatFromToAddress = (locationPrice: LocationPrice) => {
      const formatFullAddress = (
        location: Location | undefined,
        isArabic: boolean = false
      ) => {
        if (!location) return isArabic ? "غير متوفر" : "N/A";

        if (isArabic) {
          return (
            `${location.villageAr || ""}, ${location.cityAr || ""}, ${
              location.areaAr || ""
            }, ${location.countryAr || ""}`
              .replace(/^,\s*/, "")
              .replace(/,\s*,/g, ",") || "غير متوفر"
          );
        }

        return (
          `${location.village || ""}, ${location.city || ""}, ${
            location.area || ""
          }, ${location.country || ""}`
            .replace(/^,\s*/, "")
            .replace(/,\s*,/g, ",") || "N/A"
        );
      };

      // For perLocation, show the main location
      if (locationPrice.pricingMethod === "perLocation") {
        const locationAddress = formatFullAddress(locationPrice.location);
        const locationAddressAr = formatFullAddress(
          locationPrice.location,
          true
        );

        return {
          english: `Location: ${locationAddress}`,
          arabic: `الموقع: ${locationAddressAr}`,
        };
      }

      // For other pricing methods, show from/to locations
      const fromAddress = formatFullAddress(locationPrice.fromLocation);
      const toAddress = formatFullAddress(locationPrice.toLocation);
      const fromAddressAr = formatFullAddress(locationPrice.fromLocation, true);
      const toAddressAr = formatFullAddress(locationPrice.toLocation, true);

      return {
        english: `From: ${fromAddress} → To: ${toAddress}`,
        arabic: `من: ${fromAddressAr} → إلى: ${toAddressAr}`,
      };
    };

    return (
      <TableRow className="bg-gray-50">
        <TableCell colSpan={7} className="p-4">
          <div className="space-y-4">
            {item.locationPrices && item.locationPrices.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">
                        Activity Name
                      </TableHead>
                      <TableHead className="text-center">Address</TableHead>
                      <TableHead className="text-center">Cost</TableHead>
                      <TableHead className="text-center">
                        Pricing Method
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.locationPrices.map((locationPrice, index) => {
                      const addressInfo = formatFromToAddress(locationPrice);

                      return (
                        <TableRow key={index}>
                          <TableCell className="text-start">
                            <div className="text-xs space-y-1">
                              <div>
                                {typeof item.subActivity.activity === "string"
                                  ? item.subActivity.activity
                                  : item.subActivity.activity.activityNameEn}
                              </div>
                              <div>
                                {typeof item.subActivity.activity === "string"
                                  ? ""
                                  : item.subActivity.activity.activityNameAr}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-start">
                            <div className="text-xs space-y-1">
                              <div>{addressInfo.english}</div>
                              <div>{addressInfo.arabic}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {locationPrice.cost?.toLocaleString() || "N/A"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={getPricingMethodColor(
                                locationPrice.pricingMethod
                              )}
                            >
                              {
                                PRICING_METHOD_OPTIONS[
                                  locationPrice.pricingMethod
                                ]
                              }
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No location details available
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const renderTableRow = (item: SubActivityPrice, index: number) => {
    const isExpandable = EXPANDABLE_ROWS.includes(item.pricingMethod);
    const isExpanded = expandedRows.has(item.subActivity.portalItemNameEn);

    return (
      <React.Fragment key={index}>
        <TableRow key={index} className="hover:bg-gray-50">
          <TableCell className="text-center">
            {isExpandable && (
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  toggleExpanded(item.subActivity.portalItemNameEn)
                }
                className="h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="w-3 h-3" />
                ) : (
                  <ChevronDownIcon className="w-3 h-3" />
                )}
              </Button>
            )}
            {/* {!isExpandable && item.subActivity.pricingMethod === "perItem" && (
              <div className="text-xs space-y-1 text-left">
                <div>
                  {typeof item.subActivity.activity === "string"
                    ? item.subActivity.activity
                    : item.subActivity.activity.activityNameEn}
                </div>
                <div>
                  {typeof item.subActivity.activity === "string"
                    ? ""
                    : item.subActivity.activity.activityNameAr}
                </div>
              </div>
            )} */}
          </TableCell>
          <TableCell className="font-medium text-center">
            {item.subActivity.portalItemNameEn}
          </TableCell>
          <TableCell className="font-medium text-center">
            {typeof item.subActivity.activity === "string"
              ? item.subActivity.activity
              : item.subActivity.activity.activityNameEn}
          </TableCell>
          <TableCell className="font-medium text-center">
            <Badge
              className={getTransactionTypeColor(
                item.subActivity.transactionType.name
              )}
            >
              {item.subActivity.transactionType.name}
            </Badge>
          </TableCell>
          <TableCell className="font-medium text-center">
            <Badge
              className={getPricingMethodColor(item.subActivity.pricingMethod)}
            >
              {
                PRICING_METHOD_OPTIONS[
                  item.subActivity
                    .pricingMethod as keyof typeof PRICING_METHOD_OPTIONS
                ]
              }
            </Badge>
          </TableCell>
          {/* <TableCell className="font-medium text-center">
            {getStatusBadge(item.subActivity.isActive)}
          </TableCell> */}
          <TableCell className="font-medium text-center">
            {renderCostRange(item.cost, item.locationPrices)}
          </TableCell>
          <TableCell className="font-medium text-center">
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="icon"
                className="text-blue-500"
                onClick={() => {
                  setSelectedSubActivityPrice(item);
                  setDialog("edit");
                }}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-red-500 hover:text-red-600"
                onClick={() => {
                  setSelectedSubActivityPrice(item);
                  setDialog("delete");
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {isExpandable && renderExpandableContent(item)}
      </React.Fragment>
    );
  };

  const handleDialog = (open: boolean) => {
    setOpen(open);
    setDialog(null);
    setSelectedSubActivityPrice(null);
  };

  useEffect(() => {
    if (selectedSubActivityPrice && dialog === "delete") {
      setOpen(true);
    }
    if (selectedSubActivityPrice && dialog === "edit") {
      setOpenEdit(true);
    }
  }, [selectedSubActivityPrice, dialog]);

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12" />
                  {MAIN_TABLE_HEADERS.map((header) => (
                    <TableHead key={header.key} className="text-center">
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loopItems?.map((item, index) => renderTableRow(item, index))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {selectedSubActivityPrice && dialog === "delete" && (
        <DeletePriceCostListDialog
          open={open}
          onOpenChange={handleDialog}
          selectedSubActivityPrice={selectedSubActivityPrice}
        />
      )}

      {selectedSubActivityPrice && dialog === "edit" && (
        <EditPriceCostListDialog
          open={openEdit}
          selectedSubActivityPrice={selectedSubActivityPrice}
          onOpenChange={handleDialog}
        />
      )}
    </>
  );
}
