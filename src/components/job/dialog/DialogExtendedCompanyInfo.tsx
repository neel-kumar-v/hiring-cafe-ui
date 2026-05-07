import { Badge } from "@/components/ui/badge";
import UniversalTooltip from "@/components/util/UniversalTooltip";
import type { ProcessedCompanyData } from "@/types/job";
import { BadgeDollarSign, Building2, Calendar, DollarSign, Globe, Landmark, Linkedin, Users } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

type IconType = ComponentType<{ className?: string }>;

function InfoListItem({ icon: Icon, header, value, wrap = false }: { icon: IconType; header: ReactNode; value: ReactNode; wrap?: boolean }) {
  return (
    <li className={`flex items-center gap-2${wrap ? " flex-wrap" : ""}`}>
      <UniversalTooltip content={header?.toString() || ""} side="left">
        <Icon className="size-6 text-primary stroke-[1.5px]" />
      </UniversalTooltip>
      {value}
    </li>
  );
}

function CompanyInfoContent({ companyData }: { companyData: ProcessedCompanyData }) {
  const linkedinUrl = /^https?:\/\//.test(companyData.linkedin_url) ? companyData.linkedin_url : `https://${companyData.linkedin_url}`;
  const linkedinUrlWithoutProtocol = linkedinUrl.replace(/^https?:\/\//, "");

  return (
    <ul className="flex flex-col gap-2 py-2 pt-4 text-sm md:text-base">
      {companyData.year_founded && <InfoListItem icon={Calendar} header="Year Founded" value={companyData.year_founded} />}
      {companyData.num_employees && <InfoListItem icon={Users} header="Employees" value={companyData.num_employees.toLocaleString()} />}
      {companyData.headquarters_country && <InfoListItem icon={Globe} header="Company Headquarters Location" value={companyData.headquarters_country} />}
      {companyData.industries?.length > 0 && (
        <InfoListItem
          icon={Building2}
          header="Industries"
          value={companyData.industries.map((industry) => (
            <Badge key={industry} variant="outline" className="text-xs">
              {industry}
            </Badge>
          ))}
          wrap
        />
      )}
      {companyData.activities?.length > 0 && (
        <InfoListItem
          icon={Landmark}
          header="Activities"
          value={companyData.activities.slice(0, 15).map((activity) => (
            <Badge key={activity} variant="outline" className="text-xs">
              {activity.charAt(0).toUpperCase() + activity.slice(1).toLowerCase()}
            </Badge>
          ))}
          wrap
        />
      )}
      {companyData.latest_investment_amount && (
        <InfoListItem
          icon={DollarSign}
          header="Latest Investment"
          value={`$${companyData.latest_investment_amount.toLocaleString()} ${companyData.latest_investment_currency || ""}`}
        />
      )}
      {companyData.latest_investment_year && <InfoListItem icon={Calendar} header="Latest Investment Year" value={companyData.latest_investment_year} />}
      {companyData.latest_investment_series && <InfoListItem icon={BadgeDollarSign} header="Investment Series" value={companyData.latest_investment_series} />}
      {companyData.linkedin_url && (
        <InfoListItem
          icon={Linkedin}
          header="LinkedIn"
          value={
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary">
              {linkedinUrlWithoutProtocol}
            </a>
          }
        />
      )}
    </ul>
  );
}

export default function DialogExtendedCompanyInfo({ companyData }: { companyData: ProcessedCompanyData }) {
  return (
    <div className="w-full mt-4">
      <CompanyInfoContent companyData={companyData} />
    </div>
  );
}
