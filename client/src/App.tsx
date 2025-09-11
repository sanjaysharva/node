import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import Home from "@/pages/home";
import AddServer from "@/pages/add-server";
import AddBot from "@/pages/add-bot";
import AdminPage from "@/pages/admin";
import Events from "@/pages/events";
import YourServers from "@/pages/your-servers";
import NotFound from "@/pages/not-found";

function Router() {
  const { user } = useAuth();
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/advertise-server" component={AddServer} />
      <Route path="/add-bot" component={AddBot} />
      <Route path="/add-server" component={AddServer} />
      <Route path="/your-servers" component={YourServers} />
      <Route path="/events" component={Events} />
      <Route path="/admin">
          {user?.isAdmin ? <AdminPage /> : <NotFound />}
        </Route>
      <Route component={NotFound} />
    </Switch>
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