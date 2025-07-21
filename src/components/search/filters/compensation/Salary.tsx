import FilterContainer from "../util/FilterContainer";
import { RangeSlider } from "../util/RangeSlider";

interface SalaryProps {
  isDarkMode?: boolean;
}

export default function Salary({}: SalaryProps) {
  return (
    <FilterContainer title="Salary">
      <RangeSlider />
    </FilterContainer>
  );
} 