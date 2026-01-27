"use client";

import { Book, Rocket, Shield, Zap, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Learn how to launch your first meme coin on Cardano.",
    content: [
      "Connect your Cardano wallet (Nami, Eternl, etc.)",
      "Create a token with name, ticker, and image",
      "Set your bonding curve parameters",
      "Launch and share with the community",
    ],
  },
  {
    icon: Zap,
    title: "Bonding Curves",
    description: "Understand how token pricing works on PUMP.CARDANO.",
    content: [
      "Tokens start at a low price with automated price discovery",
      "As more people buy, the price increases along the curve",
      "Selling decreases the price according to the curve",
      "At 100% curve completion, tokens graduate to DEX",
    ],
  },
  {
    icon: Shield,
    title: "Safety & Risks",
    description: "Important information about meme coin trading.",
    content: [
      "Meme coins are highly volatile and speculative",
      "Only invest what you can afford to lose",
      "DYOR - Do Your Own Research before buying",
      "Watch out for rug pulls and scams",
    ],
  },
];

const Docs = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Book className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Documentation</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Everything you need to know about launching and trading meme coins on PUMP.CARDANO.
        </p>
      </motion.div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="glass-panel p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <section.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{section.title}</h2>
                <p className="text-muted-foreground text-sm mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-6 text-center"
      >
        <h3 className="font-semibold mb-2">Need more help?</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Join our community for support and updates.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Discord
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Twitter
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Docs;