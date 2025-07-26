import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { Department, Select } from "@/types/search";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";

interface FilterSectionProps {
  title: string;
  items: Department[];
  handleCheckboxChange: (department: Department) => void;
  setDepartmentsForSection: (departments: Department[], checked: boolean) => void;
}

export function FilterSection({ title, items, handleCheckboxChange, setDepartmentsForSection }: FilterSectionProps) {
  const { searchOptions } = useApp();
  const itemValue = title.toLowerCase().replace(/\s+/g, '-');
  
  let currentDepartments: Department[] = [];
  if (Array.isArray(searchOptions.department)) currentDepartments = searchOptions.department;
  
  const selectedInSection = searchOptions.department === "All" 
    ? items
    : currentDepartments.filter(item => items.includes(item));
  
  const allChecked = selectedInSection.length === items.length;
  const someChecked = selectedInSection.length > 0 && selectedInSection.length < items.length;
  const checked: boolean | "indeterminate" = allChecked ? true : someChecked ? "indeterminate" : false;

  const handleTitleChange = () => {
    setDepartmentsForSection(items, !allChecked);
  };

  return (
    <Accordion 
      type="single" 
      collapsible 
      className="w-full last-of-type:border-b-0 border-b border-b-foreground/15 hover:border-b-foreground/45 transition-all duration-700 ease-in-out"
    >
      <AccordionItem value={itemValue}>
        <AccordionPrimitive.Header className="flex group">
          <AccordionPrimitive.Trigger
            data-slot="accordion-trigger"
            className={cn(
              "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all duration-300 ease-out outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 cursor-pointer",
              "text-md font-[600] pt-0 pb-1"
            )}
          >
            <div className="flex items-center gap-2 group">
              <div 
                className="accent-pink-600 size-4 group-hover:scale-125 transition-all duration-300 ease-out peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 rounded-[4px] border shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center text-current"
                data-state={checked === true ? "checked" : checked === "indeterminate" ? "indeterminate" : "unchecked"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTitleChange();
                }}
              >
                {checked === "indeterminate" ? (
                  <span className="text-[10px] font-bold -translate-y-px">—</span>
                ) : checked === true ? (
                  <svg className="size-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </div>
              <span className="text-base select-none cursor-default">{title}</span>
            </div>
            <ChevronDownIcon className="text-muted-foreground group-hover:text-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-all duration-300 ease-out" />
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionContent className="p-2">
          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <LabelCheckbox
                key={index}
                label={item}
                checked={searchOptions.department === "All" || selectedInSection.includes(item)}
                onChange={() => handleCheckboxChange(item)}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default function Departments() {
  const { searchOptions, updateSearchOptions } = useApp();
  const allDepartments: Department[] = [
    ...technologyItems,
    ...designItems,
    ...businessOperationsItems,
    ...salesItems,
    ...healthcareItems,
    ...customerServiceItems,
    ...constructionItems,
    ...transportationItems,
    ...qualityAssuranceItems,
    ...miscellaneousItems,
  ];

  const handleCheckboxChange = (department: Department) => {
    let currentDepartments: Department[] = [];
    
    if (searchOptions.department === "All") {
      // If "All" is selected, start with all departments except the one being toggled
      currentDepartments = allDepartments.filter(item => item !== department);
    } else if (Array.isArray(searchOptions.department)) {
      currentDepartments = [...searchOptions.department];
    }
    
    let newDepartments: Select<Department>;
    
    if (searchOptions.department === "All") {
      newDepartments = currentDepartments;
    } else if (currentDepartments.includes(department)) {
      const filtered = currentDepartments.filter((item: Department) => item !== department);
      newDepartments = filtered.length === 0 ? [] : filtered;
    } else {
      const added = [...currentDepartments, department];
      newDepartments = added.length === allDepartments.length ? "All" : added;
    }
    
    if (Array.isArray(newDepartments) && newDepartments.length === allDepartments.length) {
      newDepartments = "All";
    }
    
    updateSearchOptions({
      department: newDepartments
    });
  };

  const setDepartmentsForSection = (sectionItems: Department[], checked: boolean) => {
    let currentDepartments: Department[] = [];
    
    if (searchOptions.department === "All") {
      currentDepartments = [...allDepartments];
    } else if (Array.isArray(searchOptions.department)) {
      currentDepartments = [...searchOptions.department];
    }
    
    let newDepartments: Select<Department>;
    
    if (checked) {
      const added = Array.from(new Set([...currentDepartments, ...sectionItems]));
      newDepartments = added.length === allDepartments.length ? "All" : added;
    } else {
      const filtered = currentDepartments.filter((item: Department) => !sectionItems.includes(item));
      newDepartments = filtered.length === 0 ? [] : filtered;
    }
    
    if (Array.isArray(newDepartments) && newDepartments.length === allDepartments.length) {
      newDepartments = "All";
    }
    
    updateSearchOptions({ department: newDepartments });
  };
  
  return (
    <FilterContainer title="Departments">
      <FilterSection title="Technology" items={technologyItems} handleCheckboxChange={handleCheckboxChange} setDepartmentsForSection={setDepartmentsForSection} />
      <FilterSection title="Design" items={designItems} handleCheckboxChange={handleCheckboxChange} setDepartmentsForSection={setDepartmentsForSection} />
      <FilterSection title="Business Operations" items={businessOperationsItems} handleCheckboxChange={handleCheckboxChange} setDepartmentsForSection={setDepartmentsForSection} />
      <FilterSection title="Sales" items={salesItems} handleCheckboxChange={handleCheckboxChange} setDepartmentsForSection={setDepartmentsForSection} />
      <FilterSection title="Healthcare" items={healthcareItems} handleCheckboxChange={handleCheckboxChange} setDepartmentsForSection={setDepartmentsForSection} />
      <FilterSection title="Customer Service" items={customerServiceItems} handleCheckboxChange={handleCheckboxChange} setDepartmentsForSection={setDepartmentsForSection} />
      <FilterSection title="Construction" items={constructionItems} handleCheckboxChange={handleCheckboxChange} setDepartmentsForSection={setDepartmentsForSection} />
      <FilterSection title="Transportation" items={transportationItems} handleCheckboxChange={handleCheckboxChange} setDepartmentsForSection={setDepartmentsForSection} />
      <FilterSection title="Quality Assurance" items={qualityAssuranceItems} handleCheckboxChange={handleCheckboxChange} setDepartmentsForSection={setDepartmentsForSection} />
      <FilterSection title="Miscellaneous" items={miscellaneousItems} handleCheckboxChange={handleCheckboxChange} setDepartmentsForSection={setDepartmentsForSection} />
    </FilterContainer>
  );
} 

const technologyItems: Department[] = [
  "Engineering",
  "Software Development",
  "Information Technology",
  "Data and Analytics"
]

const designItems: Department[] = [
  "Design",
  "Creative and Art Services"
]

const businessOperationsItems: Department[] = [
  "Project and Program Management",
  "Product Management",
  "Business Operations",
  "Legal and Compliance",
  "Finance and Accounting",
  "Human Resources",
  "Administrative & Clerical Support",
]

const salesItems: Department[] = [
  "Sales", 
  "Marketing",
  "Communications and Public Affairs",
  "Business Development"
]

const healthcareItems: Department[] = [
  "Advanced Practice",
  "Allied Health",
  "Nursing",
  "Pharmacy",
  "Veterinary"
]


const customerServiceItems: Department[] = [
  "Customer Service",
  "Social Services"
]

const constructionItems: Department[] = [
  "Construction",
  "Mechanical and Electrical",
  "Manufacturing and Industrial",
  "Maintenance and Repair",
  "General Labor",
]

const transportationItems: Department[] = [
  "Transportation Services",
  "Supply Chain / Logistics / Procurement",
]

const qualityAssuranceItems: Department[] = [
  "Quality Assurance",
  "Environment, Health, and Safety",
]

const miscellaneousItems: Department[] = [
  "Education",
  "Research and Development (R&D)",
  "Food and Beverage Services",
  "Protective Services",
  "Custodial Services"
]
