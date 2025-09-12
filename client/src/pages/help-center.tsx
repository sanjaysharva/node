
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { 
  MessageCircle, 
  Bot, 
  Search, 
  HelpCircle, 
  Users, 
  Settings, 
  Zap,
  ExternalLink,
  Send
} from "lucide-react";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const categories = [
    { id: "all", name: "All Topics", icon: HelpCircle },
    { id: "servers", name: "Discord Servers", icon: Users },
    { id: "bots", name: "Discord Bots", icon: Bot },
    { id: "account", name: "Account & Settings", icon: Settings },
    { id: "features", name: "Features & Tools", icon: Zap },
  ];

  const faqs = [
    {
      id: 1,
      category: "servers",
      question: "How do I add my Discord server to Smart Serve?",
      answer: "To add your Discord server, go to 'Add Server' from your dashboard. You'll need admin permissions in your Discord server and our bot must be invited to your server for verification."
    },
    {
      id: 2,
      category: "servers",
      question: "Why can't I add my server?",
      answer: "Make sure you have admin permissions in your Discord server and that our Smart Serve bot is invited to your server. The bot is required for server verification and features like bump notifications."
    },
    {
      id: 3,
      category: "bots",
      question: "How do I list my Discord bot?",
      answer: "Navigate to 'Add Bot' and provide your bot's information including commands, features, and invite link. Your bot will be reviewed before appearing in our directory."
    },
    {
      id: 4,
      category: "account",
      question: "How do I earn coins?",
      answer: "You can earn coins by joining Discord servers, inviting friends, completing daily quests, and participating in community activities. Premium users get bonus coin rewards."
    },
    {
      id: 5,
      category: "features",
      question: "What is server bumping?",
      answer: "Server bumping promotes your Discord server across our network. Use the /bump command in your server to share it with other communities. There's a 2-hour cooldown between bumps."
    },
    {
      id: 6,
      category: "account",
      question: "How do I connect my Discord account?",
      answer: "Click 'Login with Discord' in the top navigation. This will link your Discord account and allow you to manage your servers and earn rewards."
    },
    {
      id: 7,
      category: "features",
      question: "What are Smart Serve quests?",
      answer: "Quests are challenges that reward you with coins for completing specific activities like joining servers, inviting friends, or daily logins. Check your quest progress in your profile."
    },
    {
      id: 8,
      category: "servers",
      question: "How does server advertising work?",
      answer: "You can spend coins to advertise your server and gain more members. Advertised servers appear in special sections and get priority placement in search results."
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSupport = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login with Discord to contact support.",
        variant: "destructive",
      });
      return;
    }

    if (!supportMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter your support message.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: supportMessage }),
      });

      if (response.ok) {
        toast({
          title: "Support Ticket Created",
          description: "Your support request has been submitted. Our team will respond via Discord DM soon.",
        });
        setSupportMessage("");
      } else {
        throw new Error('Failed to submit support ticket');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit support ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openDiscordSupport = () => {
    // Open Discord server invite for support
    window.open('https://discord.gg/smartserve-support', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <div className="inline-block p-3 rounded-xl bg-white/20">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Help Center
            </h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90">
              Get help with Smart Serve features, Discord integration, and community management
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-3 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={openDiscordSupport}>
            <CardHeader className="text-center">
              <div className="inline-block p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 mx-auto">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>Join Discord Support</CardTitle>
              <CardDescription>
                Get instant help from our community support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Support Server
              </Button>
            </CardContent>
          </Card>

          <Dialog>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="inline-block p-3 rounded-xl bg-green-100 dark:bg-green-900/30 mx-auto">
                    <Bot className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Send a direct message to our support team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contact Support</DialogTitle>
                <DialogDescription>
                  Send us a message and we'll respond via Discord DM within 24 hours.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe your issue or question..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={5}
                />
                <Button onClick={handleContactSupport} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Support Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="inline-block p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 mx-auto">
                <Bot className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle>Bot Commands</CardTitle>
              <CardDescription>
                Learn about Smart Serve bot commands and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Commands
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <category.icon className="w-4 h-4" />
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaqs.map((faq) => (
              <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">
                      {categories.find(c => c.id === faq.category)?.name}
                    </Badge>
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bot Commands Section */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Bot className="w-6 h-6 mr-3 text-primary" />
            Smart Serve Bot Commands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Server Management</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">/bump</code>
                  <span className="text-muted-foreground">Promote your server</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">/bumpchannel set</code>
                  <span className="text-muted-foreground">Set bump channel</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">/setbump</code>
                  <span className="text-muted-foreground">Get management link</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">/bumptools</code>
                  <span className="text-muted-foreground">View bump tools info</span>
                </div>
                <div className="flex justify-between">
                  <code className="bg-muted px-2 py-1 rounded">/bumpchannel info</code>
                  <span className="text-muted-foreground">Check current settings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
