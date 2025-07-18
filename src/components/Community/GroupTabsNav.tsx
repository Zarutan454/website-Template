import * as React from "react";

interface GroupTabsNavProps {
  activeTab: "all" | "my-groups" | "suggested";
  setActiveTab: (tab: "all" | "my-groups" | "suggested") => void;
}

const tabs = [
  { id: "all", label: "Alle Gruppen" },
  { id: "my-groups", label: "Meine Gruppen" },
  { id: "suggested", label: "Vorgeschlagen" },
];

const GroupTabsNav: React.FC<GroupTabsNavProps> = ({ activeTab, setActiveTab }) => (
  <div className="flex border-b overflow-x-auto scrollbar-hide">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id as "all" | "my-groups" | "suggested")}
        className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
          activeTab === tab.id
            ? "border-b-2 border-primary text-white"
            : "text-gray-400 hover:text-white"
        }`}
        type="button"
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default GroupTabsNav; 