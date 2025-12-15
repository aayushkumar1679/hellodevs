export const TEMPLATES = {
  blank: {
    name: "Blank Canvas",
    description: "Start from scratch with an empty canvas",
    icon: "📄",
    components: [],
  },
  landing: {
    name: "Landing Page",
    description: "Modern SaaS landing page",
    icon: "🚀",
    components: [
      {
        id: "nav-1",
        type: "Navbar",
        props: { logo: "YourBrand", variant: "light" },
      },
      {
        id: "hero-1",
        type: "Hero",
        props: {
          title: "Launch Your Next Big Idea",
          subtitle: "Build, customize, and deploy in minutes",
          buttonText: "Start Building",
        },
      },
      {
        id: "features-1",
        type: "Features",
        props: {
          title: "Why Choose Us?",
          columns: 3,
          features: [
            { title: "Lightning Fast", description: "Optimized performance" },
            { title: "Easy to Use", description: "Intuitive interface" },
            { title: "Secure", description: "Enterprise security" },
          ],
        },
      },
      {
        id: "pricing-1",
        type: "Pricing",
        props: {
          title: "Simple, Transparent Pricing",
        },
      },
      {
        id: "cta-1",
        type: "CTA",
        props: {
          title: "Ready to build?",
          subtitle: "Join thousands of developers",
        },
      },
      { id: "footer-1", type: "Footer", props: {} },
    ],
  },
  portfolio: {
    name: "Portfolio",
    description: "Showcase your creative work",
    icon: "🎨",
    components: [
      {
        id: "nav-2",
        type: "Navbar",
        props: { logo: "Portfolio", variant: "light" },
      },
      {
        id: "hero-2",
        type: "Hero",
        props: {
          title: "Hi, I'm a Designer & Developer",
          subtitle: "Creating beautiful digital experiences",
          buttonText: "View My Work",
        },
      },
      {
        id: "features-2",
        type: "Features",
        props: {
          title: "Featured Projects",
          columns: 3,
          features: [
            { title: "Project 1", description: "An amazing project" },
            { title: "Project 2", description: "Another great work" },
            { title: "Project 3", description: "Innovative design" },
          ],
        },
      },
      {
        id: "image-section",
        type: "ImageSection",
        props: { title: "Gallery" },
      },
      { id: "cta-2", type: "CTA", props: { title: "Let's Work Together" } },
      { id: "footer-2", type: "Footer", props: {} },
    ],
  },
  blog: {
    name: "Blog",
    description: "Share your thoughts and ideas",
    icon: "✍️",
    components: [
      {
        id: "nav-3",
        type: "Navbar",
        props: { logo: "My Blog", variant: "light" },
      },
      {
        id: "hero-3",
        type: "Hero",
        props: {
          title: "Welcome to My Blog",
          subtitle: "Thoughts on design, code, and creativity",
          buttonText: "Read Latest",
        },
      },
      {
        id: "card-1",
        type: "Card",
        props: {
          title: "First Article",
          description: "An insightful article about web development",
          badge: "Featured",
        },
      },
      {
        id: "card-2",
        type: "Card",
        props: {
          title: "Second Article",
          description: "Tips and tricks for modern development",
          badge: "Popular",
        },
      },
      {
        id: "card-3",
        type: "Card",
        props: {
          title: "Third Article",
          description: "Best practices and patterns",
          badge: "New",
        },
      },
      { id: "footer-3", type: "Footer", props: {} },
    ],
  },
  saas: {
    name: "SaaS Product",
    description: "Professional SaaS application landing",
    icon: "💼",
    components: [
      {
        id: "nav-4",
        type: "Navbar",
        props: { logo: "SaaSName", variant: "dark" },
      },
      {
        id: "hero-4",
        type: "Hero",
        props: {
          title: "The All-in-One Platform for Your Business",
          subtitle: "Streamline workflows and boost productivity",
          buttonText: "Start Free Trial",
        },
      },
      {
        id: "features-3",
        type: "Features",
        props: {
          title: "Powerful Features",
          columns: 3,
          features: [
            { title: "Real-time Analytics", description: "Track everything" },
            {
              title: "Team Collaboration",
              description: "Work together seamlessly",
            },
            { title: "Advanced Security", description: "Enterprise-grade" },
          ],
        },
      },
      {
        id: "pricing-2",
        type: "Pricing",
        props: { title: "Choose Your Plan" },
      },
      { id: "cta-3", type: "CTA", props: { title: "Ready to transform?" } },
      { id: "footer-4", type: "Footer", props: {} },
    ],
  },
  ecommerce: {
    name: "E-Commerce",
    description: "Sell your products online",
    icon: "🛍️",
    components: [
      {
        id: "nav-5",
        type: "Navbar",
        props: { logo: "Shop", variant: "light" },
      },
      {
        id: "hero-5",
        type: "Hero",
        props: {
          title: "Summer Collection 2025",
          subtitle: "Discover our newest and most stylish items",
          buttonText: "Shop Now",
        },
      },
      {
        id: "image-section-2",
        type: "ImageSection",
        props: { title: "Featured Products", columns: 3 },
      },
      {
        id: "features-4",
        type: "Features",
        props: {
          title: "Why Shop With Us",
          columns: 3,
          features: [
            { title: "Free Shipping", description: "On orders over $50" },
            { title: "Easy Returns", description: "30-day guarantee" },
            { title: "Secure Payment", description: "SSL protected" },
          ],
        },
      },
      { id: "cta-4", type: "CTA", props: { title: "Explore Our Store" } },
      { id: "footer-5", type: "Footer", props: {} },
    ],
  },
};
