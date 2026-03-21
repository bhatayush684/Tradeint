'use client';

import { SignInButton, SignUpButton, Show } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="relative isolate min-h-[calc(100vh-65px)] overflow-hidden bg-background">
      {/* Volatile background accents */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] -z-10"
      />
      
      <div className="container mx-auto px-6 py-12 lg:flex lg:items-center lg:gap-x-12">
        {/* Text Content */}
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20 mb-6">
              <span>Just Launched: Keyless Auth</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6">
              Master Your <span className="text-primary">Trading Discipline</span> with AI
            </h1>
            
            <p className="text-lg leading-8 text-muted-foreground mb-10">
              Tradient is a comprehensive, AI-powered trading analytics dashboard built for active Forex traders. 
              Track performance, uncover behavioral patterns, score your discipline, and make data-driven improvements 
              in one sleek, automated interface.
            </p>

            <div className="flex items-center gap-x-6">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all transform hover:scale-105 active:scale-95">
                    Get Started Free
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="text-sm font-semibold leading-6 hover:text-primary transition-colors">
                    Sign In <span aria-hidden="true">→</span>
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <a href="/dashboard" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-all">
                  Go to Dashboard
                </a>
              </Show>
            </div>
          </motion.div>
        </div>

        {/* Hero Image / Animated Asset */}
        <motion.div 
          className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotateZ: [0, 1, -1, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-2xl border border-border bg-card p-2 shadow-2xl overflow-hidden"
            >
              <img
                src="/trading_hero.png"
                alt="Trading Hero Visualization"
                className="w-[500px] rounded-xl object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
            </motion.div>
            
            {/* Volatility Indicator Mockup */}
            <motion.div
              animate={{ 
                height: ["20%", "40%", "15%", "35%", "25%"],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -right-4 top-1/2 w-1 bg-primary/40 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
