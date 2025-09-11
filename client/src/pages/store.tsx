import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Coins, Zap, Crown, ShoppingCart } from "lucide-react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";

// Stripe is optional for now - payment integration will be added later
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface PaymentFormProps {
  amount: number;
  description: string;
  onSuccess: () => void;
}

const PaymentForm = ({ amount, description, onSuccess }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/store?success=true`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      onSuccess();
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">{description}</h3>
        <p className="text-2xl font-bold text-primary">${amount}</p>
      </div>
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        data-testid="button-pay"
      >
        {isProcessing ? "Processing..." : `Pay $${amount}`}
      </Button>
    </form>
  );
};

const CheckoutDialog = ({ 
  amount, 
  description, 
  children 
}: { 
  amount: number; 
  description: string; 
  children: React.ReactNode;
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !clientSecret) {
      apiRequest("POST", "/api/create-payment-intent", { amount })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch(() => {
          console.error("Failed to create payment intent");
        });
    }
  }, [isOpen, amount, clientSecret]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Purchase</DialogTitle>
          <DialogDescription>
            Secure payment powered by Stripe
          </DialogDescription>
        </DialogHeader>
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm 
              amount={amount}
              description={description}
              onSuccess={() => setIsOpen(false)}
            />
          </Elements>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function Store() {
  const { user, isAuthenticated } = useAuth();

  const coinPackages = [
    { coins: 50, price: 2, popular: false },
    { coins: 100, price: 3.5, popular: true },
    { coins: 200, price: 5, popular: false },
    { coins: 500, price: 15, popular: false },
    { coins: 1000, price: 25, popular: false },
  ];

  const advertiseBoosts = [
    { duration: "24 hours", price: 2, popular: false },
    { duration: "1 month", price: 10, popular: true },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please login with Discord to access the Store and purchase coins, boosts, and premium features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">
            <ShoppingCart className="inline w-10 h-10 mr-4" />
            Store
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Purchase coins, boosts, and premium tools to enhance your Discord server experience!
          </p>
          
          {/* Current Balance */}
          <div className="mt-6">
            <Card className="inline-block bg-white/10 border-white/20">
              <CardContent className="py-3 px-6">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-amber-400" />
                  <span className="text-xl font-bold text-white">
                    {(user as any)?.coins || 0} Coins
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coins Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Coins className="w-8 h-8 text-amber-400" />
              Coins
            </h2>
            <p className="text-gray-300">Purchase coins to unlock premium features and rewards</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {coinPackages.map((pkg, index) => (
              <Card key={index} className={`relative transition-all duration-300 hover:scale-105 bg-white/5 border-white/20 hover:bg-white/10 ${pkg.popular ? 'ring-2 ring-primary' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <Coins className="w-12 h-12 text-amber-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {pkg.coins} Coins
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    ${pkg.price}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <CheckoutDialog 
                    amount={pkg.price}
                    description={`${pkg.coins} Coins Package`}
                  >
                    <Button className="w-full" data-testid={`button-buy-${pkg.coins}-coins`}>
                      Buy Now - ${pkg.price}
                    </Button>
                  </CheckoutDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-16 bg-white/20" />

        {/* Advertise Boost Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-yellow-400" />
              Advertise Boost
            </h2>
            <p className="text-gray-300">Boost your server visibility and attract more members</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {advertiseBoosts.map((boost, index) => (
              <Card key={index} className={`transition-all duration-300 hover:scale-105 bg-white/5 border-white/20 hover:bg-white/10 ${boost.popular ? 'ring-2 ring-primary' : ''}`}>
                {boost.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                    Best Value
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <Zap className="w-12 h-12 text-yellow-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {boost.duration}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Advertise Boost
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ${boost.price}
                    </div>
                    <p className="text-sm text-gray-400">
                      Priority placement in server listings
                    </p>
                  </div>
                  <CheckoutDialog 
                    amount={boost.price}
                    description={`${boost.duration} Advertise Boost`}
                  >
                    <Button className="w-full" data-testid={`button-buy-boost-${boost.duration.replace(' ', '-')}`}>
                      Purchase - ${boost.price}
                    </Button>
                  </CheckoutDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-16 bg-white/20" />

        {/* Premium Bot Tools Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Crown className="w-8 h-8 text-purple-400" />
              Premium Tools
            </h2>
            <p className="text-gray-300">Unlock advanced bot features and management tools</p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card className="transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-400/30 hover:border-purple-400/50">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  <Crown className="w-16 h-16 text-purple-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  Premium Bot Tools
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Advanced server management features
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-purple-400 mb-4">
                    $8
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>✨ Advanced moderation tools</div>
                    <div>🔧 Custom bot configurations</div>
                    <div>📊 Detailed analytics dashboard</div>
                    <div>🚀 Priority support</div>
                  </div>
                </div>
                <CheckoutDialog 
                  amount={8}
                  description="Premium Bot Tools"
                >
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-buy-premium-tools">
                    Get Premium - $8
                  </Button>
                </CheckoutDialog>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}