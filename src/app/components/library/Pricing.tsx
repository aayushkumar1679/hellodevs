"use client";

import React from "react";

type PricingTier = {
  name: string;
  price: number;
  description: string;
  features: string[];
};

type PricingProps = {
  title?: string;
  tiers?: PricingTier[];
};

export const Pricing = ({
  title = "Pricing Plans",
  tiers = [
    {
      name: "Starter",
      price: 29,
      description: "Perfect for beginners",
      features: ["10 projects", "Basic support", "1GB storage"],
    },
    {
      name: "Pro",
      price: 79,
      description: "For professionals",
      features: ["Unlimited projects", "Priority support", "100GB storage"],
    },
    {
      name: "Enterprise",
      price: 299,
      description: "For large teams",
      features: ["Everything in Pro", "Dedicated support", "Unlimited storage"],
    },
  ],
}: PricingProps) => {
  return (
    <section className="w-full py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="bg-white p-8 rounded-lg border hover:shadow-lg transition"
            >
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className="text-gray-600 mb-4">{tier.description}</p>
              <div className="text-3xl font-bold mb-6">${tier.price}/mo</div>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="text-gray-700">
                    ✓ {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
