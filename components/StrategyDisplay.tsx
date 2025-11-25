import React from 'react';
import { BrandStrategy } from '../types';
import { CheckCircle, Layout, Share2, Monitor } from 'lucide-react';

interface StrategyDisplayProps {
  strategy: BrandStrategy;
}

export const StrategyDisplay: React.FC<StrategyDisplayProps> = ({ strategy }) => {
  return (
    <div className="bg-brand-cream border-l-4 border-brand-gold p-6 shadow-sm mb-8 animate-fade-in">
      <h3 className="font-serif text-2xl text-brand-brown mb-4 flex items-center gap-2">
        <span className="text-brand-gold">✦</span> Strategic Analysis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/50 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-brand-gold mb-1">
            <Share2 size={18} />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-brown">Platform</span>
          </div>
          <p className="font-sans text-lg text-brand-brown">{strategy.platform}</p>
        </div>

        <div className="bg-white/50 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-brand-gold mb-1">
            <Monitor size={18} />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-brown">Aspect Ratio</span>
          </div>
          <p className="font-sans text-lg text-brand-brown">{strategy.aspectRatio}</p>
        </div>

        <div className="bg-white/50 p-4 rounded-sm">
          <div className="flex items-center gap-2 text-brand-gold mb-1">
            <Layout size={18} />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-brown">Layout Style</span>
          </div>
          <p className="font-sans text-lg text-brand-brown">{strategy.layoutStyle}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Reasoning</h4>
          <p className="text-brand-brown/80 italic leading-relaxed font-sans">"{strategy.reasoning}"</p>
        </div>
        
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gray mb-1">Generated Prompt</h4>
          <div className="bg-brand-brown/5 p-3 text-sm text-brand-brown font-mono rounded-sm border border-brand-brown/10">
            {strategy.refinedPrompt}
          </div>
        </div>
      </div>
    </div>
  );
};