import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useApp } from "@/contexts/AppContext";
import { Department, Select } from "@/types/search";
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
  
  // Get the current selected departments
  const currentDepartments = searchOptions.department === "All" 
    ? [] // When "All" is selected, we don't track individual items
    : Array.isArray(searchOptions.department) 
      ? searchOptions.department 
      : [];
  
  // For this section, determine which items are selected
  const selectedInSection = searchOptions.department === "All" 
    ? items // If "All" is selected, all items in this section are selected
    : currentDepartments.filter(item => items.includes(item));
  
  const allChecked = selectedInSection.length === items.length;
  const someChecked = selectedInSection.length > 0 && selectedInSection.length < items.length;
  const checked: boolean | "indeterminate" = allChecked ? true : someChecked ? "indeterminate" : false;

  // Toggle all: if all checked, uncheck all; else check all
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
        <AccordionTrigger className="text-md font-[600] pt-0 pb-1 ">
          <LabelCheckbox
            label={title}
            checked={checked}
            onChange={handleTitleChange}
            restrictLabelClick
          />
        </AccordionTrigger>
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
      // We're unchecking from "All" state
      newDepartments = currentDepartments;
    } else if (currentDepartments.includes(department)) {
      // We're unchecking an individual item
      const filtered = currentDepartments.filter((item: Department) => item !== department);
      newDepartments = filtered.length === 0 ? [] : filtered;
    } else {
      // We're checking an individual item
      const added = [...currentDepartments, department];
      newDepartments = added.length === allDepartments.length ? "All" : added;
    }
    
    // If all selected, set to 'All'
    if (Array.isArray(newDepartments) && newDepartments.length === allDepartments.length) {
      newDepartments = "All";
    }
    
    updateSearchOptions({
      department: newDepartments
    });
  };

  // Bulk update for a section
  const setDepartmentsForSection = (sectionItems: Department[], checked: boolean) => {
    let currentDepartments: Department[] = [];
    
    if (searchOptions.department === "All") {
      // If "All" is selected, start with all departments
      currentDepartments = [...allDepartments];
    } else if (Array.isArray(searchOptions.department)) {
      currentDepartments = [...searchOptions.department];
    }
    
    let newDepartments: Select<Department>;
    
    if (checked) {
      // Add all section items that aren't already present
      const added = Array.from(new Set([...currentDepartments, ...sectionItems]));
      newDepartments = added.length === allDepartments.length ? "All" : added;
    } else {
      // Remove only the items from this specific section
      const filtered = currentDepartments.filter((item: Department) => !sectionItems.includes(item));
      newDepartments = filtered.length === 0 ? [] : filtered;
    }
    
    // If all selected, set to 'All'
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
