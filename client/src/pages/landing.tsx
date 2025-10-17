import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Star, Shield, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import heroImage from "@assets/generated_images/Hero_handyman_at_work_d9878aae.png";
import plumbingImage from "@assets/generated_images/Plumbing_service_category_image_bba940f4.png";
import electricalImage from "@assets/generated_images/Electrical_service_category_image_2eca753f.png";
import paintingImage from "@assets/generated_images/Painting_service_category_image_4e1aecfc.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">HandyConnect</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Professional handyman at work" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Find Trusted Local Handymen
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with skilled professionals for plumbing, electrical, painting, and more. 
            Book services quickly and securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary-border"
              data-testid="button-get-started"
            >
              <a href="/api/login">Get Started</a>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild
              className="bg-background/10 backdrop-blur-sm border-white/30 text-white hover:bg-background/20"
              data-testid="button-become-provider"
            >
              <a href="/api/login">Become a Provider</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose HandyConnect?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Verified Providers</h4>
              <p className="text-muted-foreground">
                All handymen are thoroughly vetted and verified for your safety and peace of mind.
              </p>
            </Card>
            
            <Card className="p-6 hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Quick Booking</h4>
              <p className="text-muted-foreground">
                Book services in minutes with our streamlined booking process and instant confirmation.
              </p>
            </Card>
            
            <Card className="p-6 hover-elevate">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Quality Service</h4>
              <p className="text-muted-foreground">
                Read reviews, compare providers, and choose the best professional for your needs.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Popular Services
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="overflow-hidden hover-elevate">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={plumbingImage} 
                  alt="Plumbing services" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2">Plumbing</h4>
                <p className="text-muted-foreground mb-4">
                  Expert plumbers for repairs, installations, and maintenance.
                </p>
                <Button variant="outline" asChild className="w-full" data-testid="button-plumbing">
                  <a href="/api/login">Find Plumbers</a>
                </Button>
              </div>
            </Card>

            <Card className="overflow-hidden hover-elevate">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={electricalImage} 
                  alt="Electrical services" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2">Electrical</h4>
                <p className="text-muted-foreground mb-4">
                  Licensed electricians for wiring, fixtures, and repairs.
                </p>
                <Button variant="outline" asChild className="w-full" data-testid="button-electrical">
                  <a href="/api/login">Find Electricians</a>
                </Button>
              </div>
            </Card>

            <Card className="overflow-hidden hover-elevate">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={paintingImage} 
                  alt="Painting services" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2">Painting</h4>
                <p className="text-muted-foreground mb-4">
                  Professional painters for interior and exterior projects.
                </p>
                <Button variant="outline" asChild className="w-full" data-testid="button-painting">
                  <a href="/api/login">Find Painters</a>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h3>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of satisfied customers who found the perfect handyman through HandyConnect.
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-background text-foreground hover:bg-background/90"
            data-testid="button-cta-signup"
          >
            <a href="/api/login">Sign Up Now</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 HandyConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
