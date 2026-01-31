"use client";

import { Film, Tv, Plus, Filter, List } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-black">Watchlist</h1>
          <p className="text-gray-500 text-sm">
            What would you like to do first?
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 gap-4">
          
          <ActionCard
            icon={<Plus />}
            title="Add to Watchlist"
            description="Save a movie or TV show recommendation"
          />

          <ActionCard
            icon={<List />}
            title="View My Watchlist"
            description="See everything you’ve saved so far"
          />

          <ActionCard
            icon={<Filter />}
            title="Filter & Organize"
            description="Sort by status, type, or rating"
          />
        </div>

        {/* Future hint */}
        <div className="text-center text-xs text-gray-400 pt-2">
          You can change this anytime
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      className="
        group
        flex items-center gap-4
        w-full text-left
        border border-gray-200
        rounded-xl p-4
        transition-all duration-200
        hover:border-black hover:shadow-sm
        active:scale-[0.98]
      "
    >
      <div
        className="
          flex items-center justify-center
          w-10 h-10
          rounded-full
          border border-gray-300
          text-gray-700
          group-hover:border-black group-hover:text-black
          transition
        "
      >
        {icon}
      </div>

      <div className="space-y-1">
        <div className="font-medium text-black">{title}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
    </button>
  );
}
