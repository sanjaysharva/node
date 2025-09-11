import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { Server, Bot, Building2, Star, Zap, TrendingUp } from "lucide-react";

export default function Advertise() {
  const advertisingOptions = [
    {
      id: "discord-server",
      title: "Advertise Your Discord Server",
      description: "Promote your Discord community to thousands of potential members. Get discovered by users looking for active servers in your niche.",
      icon: Server,
      features: [
        "Featured placement in server listings",
        "Category-specific promotion",
        "Member count boost visibility",
        "Custom server spotlight",
        "Analytics dashboard"
      ],
      pricing: [
        { plan: "Basic", price: "$9.99", duration: "7 days", popular: false },
        { plan: "Premium", price: "$24.99", duration: "30 days", popular: true },
        { plan: "Spotlight", price: "$49.99", duration: "60 days", popular: false }
      ],
      gradient: "from-blue-500 to-cyan-400"
    },
    {
      id: "discord-bot",
      title: "Advertise Your Discord Bot",
      description: "Showcase your Discord bot to server owners and developers. Increase installations and user engagement with targeted promotion.",
      icon: Bot,
      features: [
        "Bot directory featured listing",
        "Command showcase display",
        "Installation count highlights",
        "Developer verification badge",
        "Usage statistics tracking"
      ],
      pricing: [
        { plan: "Starter", price: "$14.99", duration: "14 days", popular: false },
        { plan: "Growth", price: "$39.99", duration: "45 days", popular: true },
        { plan: "Pro", price: "$69.99", duration: "90 days", popular: false }
      ],
      gradient: "from-purple-500 to-pink-400"
    },
    {
      id: "business",
      title: "Advertise Your Business",
      description: "Connect with the Discord community to promote your products, services, or brand. Reach engaged audiences through targeted campaigns.",
      icon: Building2,
      features: [
        "Banner advertisements",
        "Sponsored content placement",
        "Community partnership programs",
        "Brand verification status",
        "Campaign performance metrics"
      ],
      pricing: [
        { plan: "Small", price: "$29.99", duration: "1 week", popular: false },
        { plan: "Business", price: "$79.99", duration: "1 month", popular: true },
        { plan: "Enterprise", price: "$199.99", duration: "3 months", popular: false }
      ],
      gradient: "from-green-500 to-emerald-400"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/20 via-background to-background">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text animate-gradient-x bg-300%">
                Advertise with Smart Serve
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Reach thousands of Discord users and grow your community, bot, or business with our targeted advertising solutions
              </p>
            </div>
            <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>High Engagement Rates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Instant Approval</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-primary" />
                <span>Premium Placement</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advertising Options */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-16">
          {advertisingOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <div key={option.id} className="space-y-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${option.gradient} shadow-lg`}>
                      <IconComponent className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    {option.title}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {option.description}
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  {/* Features */}
                  <Card className="glass-card h-full">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">What's Included</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {option.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">Choose Your Plan</h3>
                    <div className="grid gap-4">
                      {option.pricing.map((plan, planIndex) => (
                        <Card 
                          key={planIndex} 
                          className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                            plan.popular 
                              ? 'border-primary shadow-lg shadow-primary/20' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {plan.popular && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                              Most Popular
                            </div>
                          )}
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold text-lg">{plan.plan}</h4>
                                <p className="text-sm text-muted-foreground">{plan.duration}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{plan.price}</div>
                                <Button 
                                  className="mt-2 w-full bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
                                  data-testid={`button-select-${option.id}-${plan.plan.toLowerCase()}`}
                                >
                                  Select Plan
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-24 text-center space-y-8">
          <Card className="glass-card max-w-4xl mx-auto">
            <CardContent className="p-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join thousands of successful Discord communities and businesses that have grown with Smart Serve advertising.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
                    data-testid="button-contact-sales"
                  >
                    Contact Sales Team
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                    data-testid="button-learn-more"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}