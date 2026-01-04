import React, { useState, useRef } from 'react';
import { BrandStrategy } from '../types';
import { CheckCircle, Layout, Share2, Monitor, ShoppingBag } from 'lucide-react';

interface StrategyDisplayProps {
  strategy: BrandStrategy;
}

export const StrategyDisplay: React.FC<StrategyDisplayProps> = ({ strategy }) => {
  return (
    <div className="bg-brand-cream border-l-4 border-brand-gold p-6 shadow-sm mb-8 animate-fade-in">
      <h3 className="font-serif text-2xl text-brand-brown mb-4 flex items-center gap-2">
        <span className="text-brand-gold">✦</span> Strategic Analysis
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/50 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-brand-gold mb-1">
            <Share2 size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown">Platform</span>
          </div>
          <p className="font-sans text-base text-brand-brown leading-tight">{strategy.platform}</p>
        </div>

        <div className="bg-white/50 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-brand-gold mb-1">
            <ShoppingBag size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown">Featured Product</span>
          </div>
          <p className="font-sans text-base text-brand-brown leading-tight">{strategy.featuredProduct || 'Lifestyle / Brand'}</p>
        </div>

        <div className="bg-white/50 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-brand-gold mb-1">
            <Monitor size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown">Ratio</span>
          </div>
          <p className="font-sans text-base text-brand-brown leading-tight">{strategy.aspectRatio}</p>
        </div>

        <div className="bg-white/50 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-brand-gold mb-1">
            <Layout size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-brown">Layout</span>
          </div>
          <p className="font-sans text-base text-brand-brown leading-tight">{strategy.layoutStyle}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Reasoning</h4>
          <p className="text-brand-brown/80 italic leading-relaxed font-sans text-sm">"{strategy.reasoning}"</p>
        </div>
        
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Generated Prompt</h4>
          <div className="bg-brand-brown/5 p-3 text-xs text-brand-brown font-mono rounded-sm border border-brand-brown/10 whitespace-pre-wrap">
            {strategy.refinedPrompt}
          </div>
        </div>
      </div>
    </div>
  );
};