import FilterContainer from "../util/FilterContainer";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";

export default function Location() {
  return (
    <FilterContainer title="Location">
      <LabelInputContainer>
        <LabelCheckbox label="Use Current Location" checked={true} onChange={() => {}} className="col-span-4"/>
      </LabelInputContainer>
      
    </FilterContainer>
  );
} 