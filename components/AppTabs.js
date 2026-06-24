"use client";

import { useState } from "react";
import RegionalAnesthesiaTool from "@/components/RegionalAnesthesiaTool";
import DrugDoseCalculator from "@/components/DrugDoseCalculator";
import BloodTransfusion from "@/components/BloodTransfusion";
import LastToxicity from "@/components/LastToxicity";
import MalignantHyperthermia from "@/components/MalignantHyperthermia";

const TABS = [
  { id: "regional", label: "区域麻酔判定", Component: RegionalAnesthesiaTool },
  { id: "drugdose", label: "投与量計算", Component: DrugDoseCalculator },
  { id: "blood", label: "輸血", Component: BloodTransfusion },
  { id: "last", label: "局所麻酔薬中毒", Component: LastToxicity },
  { id: "mh", label: "悪性高熱症", Component: MalignantHyperthermia },
];

export default function AppTabs() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const ActiveComponent = TABS.find((t) => t.id === activeTab).Component;

  return (
    <div>
      <nav className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap gap-x-1 gap-y-1 px-2 py-1.5 sm:px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-teal-deep text-white"
                  : "text-ink-faint hover:bg-bg-subtle hover:text-ink-soft"
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
