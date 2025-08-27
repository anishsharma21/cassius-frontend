import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Guide = () => {
  const { user: userData } = useAuth();
  
  return (
    <div className="p-6">
      <p className="text-3xl font-bold mb-1">Welcome to the Cassius beta!</p>
      <br></br>
      <p className="text-base mb-2">Hey {userData?.display_name},</p>
      <p className="text-base">You are one of the very first people to ever use Cassius - thank you so much.</p>
      <p className="text-base">We built this product because we felt the same pain every early team feels: building is easier than ever, but getting customers still feels messy and overwhelming. </p>
      <p className="text-base">Our hope is that Cassius makes growth feel clearer, faster, and much more enjoyable.</p>
      <p className="text-base">We have already used these features to grow our own waitlist to over 1,000 businesses. We’ve hand-selected you to try it out, as someone we feel could get immediate value, and help us meaningfully shape v2.</p>
      <br></br>
      <p className="text-base">We know the product isn’t super polished, may be a tad janky, and isn’t beautiful (yet). We’ve intentionally made v1 light and simple so we can iron out the exact workflows, and build a truely agentic system around the most valuable features immediately for v2.</p>
      <p className="text-base mb-2">Please be honest with us. Tell us what feels useful, what feels confusing, and what you would like to see next. Your feedback at this stage will shape the future of Cassius more than anything else.</p>
      <p className="text-base ml-4">~ Jock, Gaurav, and Jason</p>
      <br></br>
      <p className="text-2xl font-semibold mb-2">What you can try right now</p>
      <p className="text-base mb-2">This first version is light by design. We wanted to get it into your hands early so we can learn from your experience before we expand.</p>
      <ul className="list-disc ml-6 space-y-2">
        <li><strong>Reddit:</strong> Cassius finds the most relevant conversations for your product and suggests replies you can post.</li>
        <li><strong>SEO:</strong> Shows where you currently rank, and writes SEO friendly blogs that are structured to improve visibility.</li>
        <li><strong>Partnerships:</strong> Surfaces relevant micro influencers in your space with contact details and suggested outreach copy.</li>
        <li><strong>Profile Library:</strong> A place to upload docs, links, and resources so Cassius can understand your business and improve its recommendations.</li>
      </ul>
      <br></br>
      <p className="text-2xl font-semibold mb-2">What we're working towards</p>
      <p className="text-base">The next version of Cassius will take a bigger step into execution. Soon, the agents will be able to post to Reddit for you, publish blogs directly to sites like WordPress and Webflow, and reach out to influencers on your behalf.</p>
      <p className="text-base">We will also introduce new hubs, including a GEO hub for LLM-optimised content, and expand the agents within existing hubs, including deeper SEO audits, influencer analytics, Reddit warming up agents and tons more.</p>
      <p className="text-base">We have also heard your non-negotiables, and we know that avoiding AI slop is huge for you. V2 is being built to learn from your documents, your brand style, the way you speak to it, and the revisions you make. </p>
      <p className="text-base">Right now, our focus is on building the best foundation. That means simple features that work well, and a workflow that feels natural. We are guided by you entirely on this pursuit. </p>
      <br></br>
      <p className="text-2xl font-semibold mb-2">How to get started</p>
      <p className="text-base">1. Fill out your Profile Library with as much detail as possible</p>
      <p className="text-base">2. Ask Cassius for a strategy and see the recommendations</p>
      <p className="text-base">3. Execute the strategies</p>
      <p className="text-base">4. Share your feedback with us</p>
      <br></br>
      <p className="text-base mb-2">You are helping us create something that we believe can change how small teams grow. We are so grateful to have you on this journey with us.</p>
      <p className="text-base">Happy marketing!</p>
      
    </div>
  );
};

export default Guide;
