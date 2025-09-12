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
import Explore from "@/pages/explore";
import JoinMembers from "@/pages/join-members";
import Store from "@/pages/store";
import Quest from "@/pages/quest";
import YourServers from "@/pages/your-servers";
import Advertise from "@/pages/advertise";
import Profile from "@/pages/profile";
import AddEvent from "@/pages/add-event";
import SearchPage from "@/pages/search";
import ServerDetail from "@/pages/server-detail";
import NotFound from "@/pages/not-found";
import CookieConsent from "@/components/cookie-consent";
import HelpCenter from "./pages/help-center";
import TermsOfService from "./pages/terms-of-service";
import PrivacyPolicy from "./pages/privacy-policy";
import Blog from "./pages/blog";
import Partnership from "@/pages/partnership";
import AddPartnership from "@/pages/add-partnership";
import ServerTemplates from "@/pages/server-templates";
import AddTemplate from "@/pages/add-template";
import Login from "@/pages/login";
import { lazy } from "react";


function Router() {
  const { user } = useAuth();
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/advertise" component={Advertise} />
      <Route path="/advertise-server" component={AddServer} />
      <Route path="/add-bot" component={AddBot} />
      <Route path="/add-server" component={AddServer} />
      <Route path="/your-servers" component={YourServers} />
      <Route path="/events" component={Events} />
      <Route path="/explore" component={Explore} />
      <Route path="/join-members" component={JoinMembers} />
      <Route path="/store" component={Store} />
      <Route path="/quest" component={Quest} />
      <Route path="/partnership" component={Partnership} />
      <Route path="/server-templates" component={ServerTemplates} />
      <Route path="/jobs" component={lazy(() => import("./pages/jobs"))} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <CookieConsent />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;