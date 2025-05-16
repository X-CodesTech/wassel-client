import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import ActivityManagement from "@/pages/ActivityManagement";
import PriceLists from "@/pages/PriceLists";
import PriceListDetails from "@/pages/PriceListDetails";
import CustomerDetails from "@/pages/CustomerDetails";
import TransactionTypes from "@/pages/TransactionTypes";
import MainLayout from "@/components/MainLayout";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={ActivityManagement}/>
        <Route path="/price-lists" component={PriceLists}/>
        <Route path="/price-lists/:id" component={PriceListDetails}/>
        <Route path="/customers/:id" component={CustomerDetails}/>
        <Route path="/transaction-types" component={TransactionTypes}/>
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
