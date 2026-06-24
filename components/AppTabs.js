"use client";

import { useState } from "react";
import RegionalAnesthesiaTool from "@/components/RegionalAnesthesiaTool";
import DrugDoseCalculator from "@/components/DrugDoseCalculator";
import BloodTransfusion from "@/components/BloodTransfusion";

const TABS = [
  { id: "regional", label: "区域麻酔・神経ブロック判定", Component: RegionalAnesthesiaTool },
  { id: "drugdose", label: "薬剤投与量計算", Component: DrugDoseCalculator },
  { id: "blood", label: "輸血", Component: BloodTransfusion },
];

export default function AppTabs() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const ActiveComponent = TABS.find((t) => t.id === activeTab).Component;

  return (
    <div>
      <nav className="sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 sm:px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-teal-deep text-teal-ink"
                  : "border-transparent text-ink-faint hover:text-ink-soft"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
      <ActiveComponent />
    </div>
  );
}
