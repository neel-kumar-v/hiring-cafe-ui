export const formatCompanyName = (companyName: string) => {
  if (!companyName) return "(No Company Name Listed)";
  return companyName.replace(/\s*\(.*?\)\s*/g, " ").trim();
};

export const getCompanyAbbreviation = (companyName: string) => {
  if (!companyName) return "";
  return formatCompanyName(companyName)
    .split(" ")
    .map((word) => {
      if (!word) return "";
      let abbrev = word[0];
      abbrev += word
        .slice(1)
        .split("")
        .filter((c) => c >= "A" && c <= "Z")
        .join("");
      return abbrev;
    })
    .join("")
    .slice(0, 4);
};

export const renderCompanyAbbreviationGrid = (companyName: string) => {
  if (companyName.length !== 4) return companyName;
  const letters = companyName.split("").map((letter) => letter.toUpperCase());
  return (
    <span className="inline-grid grid-cols-2 grid-rows-2 gap-x-0.5">
      <span className="font-bold">{letters[0]}</span>
      <span className="font-bold text-center">{letters[1]}</span>
      <span className="font-bold">{letters[2]}</span>
      <span className="font-bold text-center">{letters[3]}</span>
    </span>
  );
};
