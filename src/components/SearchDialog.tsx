import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useState } from "react";

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
            <h3 className="font-semibold text-lg">Departments</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Filter jobs by department or team.
            </p>
            <div className="space-y-2">
              <Badge
                className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                variant="outline"
              >
                Engineering
              </Badge>
              <Badge
                className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                variant="outline"
              >
                Product
              </Badge>
              <Badge
                className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                variant="outline"
              >
                Design
              </Badge>
              <Badge
                className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                variant="outline"
              >
                Marketing
              </Badge>
              <Badge
                className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
                variant="outline"
              >
                Sales
              </Badge>
            </div>
          </div>
        );

      case "salary":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Salary Range</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Set your desired salary range.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  className="w-24 rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                  placeholder="Min"
                  type="number"
                />
                <span className="text-neutral-500">to</span>
                <input
                  className="w-24 rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                  placeholder="Max"
                  type="number"
                />
              </div>
            </div>
          </div>
        );

      case "apply-form":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Apply Form Type</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Choose your preferred application form type.
            </p>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center space-x-2">
                <input
                  defaultChecked
                  name="apply-form"
                  type="radio"
                  value="all"
                />
                <span>All apply forms</span>
              </label>
              <label className="flex cursor-pointer items-center space-x-2">
                <input name="apply-form" type="radio" value="simple" />
                <span>Simple apply forms</span>
              </label>
              <label className="flex cursor-pointer items-center space-x-2">
                <input name="apply-form" type="radio" value="time-consuming" />
                <span>Time consuming apply forms</span>
              </label>
            </div>
          </div>
        );

      case "date-range":
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Date Range</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Filter jobs by posting date.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  className="w-16 rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
                  placeholder="3"
                  type="number"
                />
                <select className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
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
            <h3 className="font-semibold text-lg">Sorting Options</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Choose how to sort the job results.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-medium text-sm">
                  Sort by
                </label>
                <select className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white">
                  <option value="relevance">Relevance</option>
                  <option value="recent">Recent</option>
                  <option value="salary">Salary</option>
                  <option value="experience">Experience</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block font-medium text-sm">Order</label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      defaultChecked
                      name="order"
                      type="radio"
                      value="asc"
                    />
                    <span>Ascending</span>
                  </label>
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input name="order" type="radio" value="desc" />
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
            <h3 className="font-semibold text-lg">
              {selectedCategoryData?.name}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Settings for {selectedCategoryData?.name.toLowerCase()} will be
              implemented here.
            </p>
            <div className="rounded-lg border-2 border-neutral-300 border-dashed p-8 text-center dark:border-neutral-600">
              <p className="text-neutral-500 dark:text-neutral-400">
                Content for {selectedCategoryData?.name} will be added later
              </p>
            </div>
          </div>
        );
    }
  };

  const renderSidebar = () => (
    <div className="w-[30%] overflow-y-auto border-neutral-200 border-r bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="space-y-2 p-4">
        {settingsCategories.map((category) => (
          <Button
            className={`h-auto w-full justify-start px-4 py-3 text-left ${
              selectedCategory === category.id
                ? "bg-pink-600 text-white hover:bg-pink-700"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            variant={selectedCategory === category.id ? "default" : "ghost"}
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
    <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
  );

  if (!isDesktop) {
    // Mobile: Render as drawer
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent className="max-h-[90vh] min-h-[60vh] overflow-y-auto">
          <DrawerHeader className="border-neutral-200 border-b px-6 py-4 dark:border-neutral-700">
            <DrawerTitle>Create your Job Search</DrawerTitle>
            <DrawerDescription>
              Configure your job search preferences and filters
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex h-full flex-col">
            {/* Mobile: Stack sidebar and content vertically */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="scrollbar-hide mb-4 flex flex-row gap-2 space-y-1 overflow-x-auto">
                  {settingsCategories.map((category) => (
                    <Button
                      className={`h-auto w-fit justify-start px-4 py-2 text-left text-sm ${
                        selectedCategory === category.id
                          ? "bg-pink-600 text-white hover:bg-pink-700"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      }`}
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      variant={
                        selectedCategory === category.id ? "default" : "ghost"
                      }
                    >
                      <span className="font-medium text-sm">
                        {category.name}
                      </span>
                    </Button>
                  ))}
                </div>

                <div className="border-neutral-200 border-t pt-4 dark:border-neutral-700">
                  {renderContent()}
                </div>
              </div>
            </div>

            <DrawerFooter>
              <div className="flex justify-end space-x-2">
                <Button onClick={() => onOpenChange(false)} variant="outline">
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
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className={`h-[90vh] w-[800px] min-w-[80vw] max-w-[90vw] border border-neutral-100 bg-white p-0 dark:border-neutral-700 dark:bg-neutral-800 ${
          isDarkMode ? "dark" : ""
        }`}
      >
        <DialogHeader className="border-neutral-200 border-b px-6 py-4 dark:border-neutral-700">
          <DialogTitle>Create your Job Search</DialogTitle>
          <DialogDescription>
            Configure your job search preferences and filters
          </DialogDescription>
        </DialogHeader>

        <div className="-translate-y-[16px] flex h-[calc(90vh-100px)]">
          {renderSidebar()}
          {renderContentArea()}
        </div>

        <DialogFooter className="border-neutral-200 border-t px-6 py-4 dark:border-neutral-700">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Apply Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
