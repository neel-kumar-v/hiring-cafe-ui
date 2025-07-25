import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSearch } from "@/contexts/SearchContext";
import { Department, Select } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";

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



interface FilterSectionProps {
  title: string;
  items: Department[];
  handleCheckboxChange: (department: Department) => void;
  setDepartmentsForSection: (departments: Department[], checked: boolean) => void;
}

export function FilterSection({ title, items, handleCheckboxChange, setDepartmentsForSection }: FilterSectionProps) {
  const { searchOptions } = useSearch();
  const itemValue = title.toLowerCase().replace(/\s+/g, '-');
  const selected = Array.isArray(searchOptions.department) ? searchOptions.department : [];
  const allChecked = items.every(item => selected.includes(item) || searchOptions.department === "All");
  const someChecked = items.some(item => selected.includes(item) || searchOptions.department === "All");
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
                checked={selected.includes(item) || searchOptions.department === "All"}
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
  const { searchOptions, updateSearchOptions } = useSearch();
  const handleCheckboxChange = (department: Department) => {
    const currentDepartments = searchOptions.department;
    let newDepartments: Select<Department>;
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
    if (!Array.isArray(currentDepartments)) {
      newDepartments = [department];
    } else if (currentDepartments.includes(department)) {
      const filtered = currentDepartments.filter((item: Department) => item !== department);
      newDepartments = filtered.length === 0 ? "All" : filtered;
    } else {
      const added = [...currentDepartments, department];
      newDepartments = added.length === allDepartments.length ? "All" : added;
    }
    updateSearchOptions({
      department: newDepartments
    });
  };

  // Bulk update for a section
  const setDepartmentsForSection = (sectionItems: Department[], checked: boolean) => {
    const currentDepartments = Array.isArray(searchOptions.department) ? searchOptions.department : [];
    let newDepartments: Select<Department>;
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
    if (checked) {
      // Add all section items that aren't already present
      const added = Array.from(new Set([...currentDepartments, ...sectionItems]));
      newDepartments = added.length === allDepartments.length ? "All" : added;
    } else {
      // Remove all section items
      const filtered = currentDepartments.filter((item: Department) => !sectionItems.includes(item));
      newDepartments = filtered.length === 0 ? "All" : filtered;
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