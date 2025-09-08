import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Import the existing page components
import Payroll from "./payroll";
import Invoices from "./invoices";

export default function Finance() {
  const [activeTab, setActiveTab] = useState("payroll");

  return (
    <div className="space-y-6">
      {/* Custom tab navigation */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "payroll" ? "default" : "ghost"}
          onClick={() => setActiveTab("payroll")}
          className={cn(
            "flex items-center space-x-2 rounded-md px-4 py-2",
            activeTab === "payroll" ? "bg-white shadow-sm" : "hover:bg-slate-200"
          )}
        >
          <DollarSign className="w-4 h-4" />
          <span>Payroll</span>
        </Button>
        <Button
          variant={activeTab === "invoices" ? "default" : "ghost"}
          onClick={() => setActiveTab("invoices")}
          className={cn(
            "flex items-center space-x-2 rounded-md px-4 py-2",
            activeTab === "invoices" ? "bg-white shadow-sm" : "hover:bg-slate-200"
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Invoices</span>
        </Button>
      </div>
      
      {/* Tab content */}
      <div className="mt-6">
        {activeTab === "payroll" && <Payroll />}
        {activeTab === "invoices" && <Invoices />}
      </div>
    </div>
  );
}