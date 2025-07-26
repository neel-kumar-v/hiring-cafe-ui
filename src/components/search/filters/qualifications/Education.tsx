import FilterContainer from "../util/FilterContainer";
import LabelCheckbox, { LabelCheckboxContainer } from "../util/LabelCheckbox";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";

export default function Education() {
  return (
    <FilterContainer title="Education">
      <p className="text-base border-b border-b-input pr-2 text-text mb-2">
        Associate&apos;s Degree
      </p>
      <LabelCheckboxContainer midColCount={3} lgColCount={5}>
        <LabelCheckbox label="Required" checked={false} onChange={() => {}} />
        <LabelCheckbox label="Preferred" checked={false} onChange={() => {}} />
        <LabelCheckbox label="Not Mentioned" checked={false} onChange={() => {}} />
      </LabelCheckboxContainer>
      <KeywordsMultiSelect value={{ include: [], exclude: [] }} onChange={() => {}} includeOptions={[]} excludeOptions={[]} />
      <p className="text-base border-b border-b-input pr-2 text-text mb-2">
        Bachelor&apos;s Degree
      </p>
      <LabelCheckboxContainer midColCount={3} lgColCount={5}>
        <LabelCheckbox label="Required" checked={false} onChange={() => {}} />
        <LabelCheckbox label="Preferred" checked={false} onChange={() => {}} />
        <LabelCheckbox label="Not Mentioned" checked={false} onChange={() => {}} />
      </LabelCheckboxContainer>
      <KeywordsMultiSelect value={{ include: [], exclude: [] }} onChange={() => {}} includeOptions={[]} excludeOptions={[]} />
      <p className="text-base border-b border-b-input pr-2 text-text mb-2">
        Master&apos;s Degree
      </p>
      <LabelCheckboxContainer midColCount={3} lgColCount={5}>
        <LabelCheckbox label="Required" checked={false} onChange={() => {}} />
        <LabelCheckbox label="Preferred" checked={false} onChange={() => {}} />
        <LabelCheckbox label="Not Mentioned" checked={false} onChange={() => {}} />
      </LabelCheckboxContainer>
      <p className="text-base border-b border-b-input pr-2 text-text mb-2">
        PhD
      </p>
      <KeywordsMultiSelect value={{ include: [], exclude: [] }} onChange={() => {}} includeOptions={[]} excludeOptions={[]} />
      <LabelCheckboxContainer midColCount={3} lgColCount={5}>
        <LabelCheckbox label="Required" checked={false} onChange={() => {}} />
        <LabelCheckbox label="Preferred" checked={false} onChange={() => {}} />
        <LabelCheckbox label="Not Mentioned" checked={false} onChange={() => {}} />
      </LabelCheckboxContainer>
      <KeywordsMultiSelect value={{ include: [], exclude: [] }} onChange={() => {}} includeOptions={[]} excludeOptions={[]} />
    </FilterContainer>
  );
} 