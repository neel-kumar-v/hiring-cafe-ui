import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

// Define the settings categories
const settingsCategories = [
  // Job Filters
  { id: "departments", name: "Departments", type: "filter" },
  { id: "salary", name: "Salary", type: "filter" },
  { id: "commitment", name: "Commitment", type: "filter" },
  { id: "experience", name: "Experience", type: "filter" },
  { id: "job-titles", name: "Job Titles & Keywords", type: "filter" },
  { id: "education", name: "Education", type: "filter" },
  { id: "licenses", name: "Licenses & Certifications", type: "filter" },
  { id: "security", name: "Security Clearance", type: "filter" },
  { id: "languages", name: "Languages", type: "filter" },
  { id: "shifts", name: "Shifts & Schedules", type: "filter" },
  { id: "travel", name: "Travel Requirement", type: "filter" },
  { id: "benefits", name: "Benefits & Perks", type: "filter" },
  { id: "encouraged", name: "Encouraged to Apply", type: "filter" },

  // Company Filters
  { id: "company", name: "Company", type: "company" },
  { id: "industry", name: "Industry", type: "company" },
  { id: "stage", name: "Stage & Funding", type: "company" },
  { id: "size", name: "Size", type: "company" },
  { id: "founding", name: "Founding Year", type: "company" },

  // Other Options
  { id: "apply-form", name: "Apply Form Type", type: "other" },
  { id: "date-range", name: "Date Range", type: "other" },
  { id: "sorting", name: "Sorting", type: "other" },
];

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from?: string; // Track what caused the dialog to open
}

export default function SearchDialog({
  open,
  onOpenChange,
  from,
}: SearchDialogProps) {
  const { isDarkMode } = useDarkMode();
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [selectedCategory, setSelectedCategory] = useState(() => {
    // Set initial category based on what opened the dialog
    if (from) {
      const category = settingsCategories.find(
        (cat) =>
          cat.name.toLowerCase().includes(from.toLowerCase()) ||
          cat.id.toLowerCase().includes(from.toLowerCase())
      );
      return category?.id || settingsCategories[0].id;
    }
    return settingsCategories[0].id;
  });

  const selectedCategoryData = settingsCategories.find(
    (cat) => cat.id === selectedCategory
  );

  const renderContent = () => {
    switch (selectedCategory) {
      case "departments":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Departments</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Filter jobs by department or team.
            </p>
            <div className="space-y-2">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Engineering
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Product
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Design
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Marketing
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sales
              </Badge>
            </div>
          </div>
        );

      case "salary":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Salary Range</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Set your desired salary range.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        );

      case "apply-form":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Apply Form Type</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose your preferred application form type.
            </p>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="apply-form"
                  value="all"
                  defaultChecked
                />
                <span>All apply forms</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="apply-form" value="simple" />
                <span>Simple apply forms</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="apply-form" value="time-consuming" />
                <span>Time consuming apply forms</span>
              </label>
            </div>
          </div>
        );

      case "date-range":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Date Range</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Filter jobs by posting date.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="3"
                  className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "sorting":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sorting Options</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose how to sort the job results.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sort by
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="relevance">Relevance</option>
                  <option value="recent">Recent</option>
                  <option value="salary">Salary</option>
                  <option value="experience">Experience</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="order"
                      value="asc"
                      defaultChecked
                    />
                    <span>Ascending</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="order" value="desc" />
                    <span>Descending</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {selectedCategoryData?.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Settings for {selectedCategoryData?.name.toLowerCase()} will be
              implemented here.
            </p>
            <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Content for {selectedCategoryData?.name} will be added later
              </p>
            </div>
          </div>
        );
    }
  };

  const renderSidebar = () => (
    <div className="w-[30%] border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
      <div className="p-4 space-y-2">
        {settingsCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "ghost"}
            className={`w-full justify-start text-left h-auto py-3 px-4 ${
              selectedCategory === category.id
                ? "bg-pink-600 text-white hover:bg-pink-700"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">{category.name}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );

  const renderContentArea = () => (
    <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>
  );

  if (!isDesktop) {
    // Mobile: Render as drawer
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] min-h-[60vh] overflow-y-auto">
          <DrawerHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <DrawerTitle>Create your Job Search</DrawerTitle>
            <DrawerDescription>
              Configure your job search preferences and filters
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col h-full">
            {/* Mobile: Stack sidebar and content vertically */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                
                <div className="mb-4 space-y-1 flex flex-row overflow-x-auto scrollbar-hide gap-2">
                  {settingsCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "ghost"
                      }
                      className={`w-fit justify-start text-left h-auto py-2 px-4 text-sm ${
                        selectedCategory === category.id
                          ? "bg-pink-600 text-white hover:bg-pink-700"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="font-medium text-sm">{category.name}</span>
                    </Button>
                  ))}
                </div>
              

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  {renderContent()}
                </div>
              </div>
            </div>

            <DrawerFooter>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  Apply Settings
                </Button>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Render as dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`h-[90vh]  w-[800px] max-w-[90vw] min-w-[80vw] border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700 p-0 ${
          isDarkMode ? "dark" : ""
        }`}
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle>Create your Job Search</DialogTitle>
          <DialogDescription>
            Configure your job search preferences and filters
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[calc(90vh-100px)] -translate-y-[16px]">
          {renderSidebar()}
          {renderContentArea()}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Apply Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
