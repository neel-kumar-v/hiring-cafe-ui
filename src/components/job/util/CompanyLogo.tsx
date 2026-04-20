import {
  analyzeImageBackground,
  companyFaviconUrl,
  extractDomainFromCompanyWebsite,
  getCompanyAbbreviation,
  getImageBackgroundClass,
  renderCompanyAbbreviationGrid,
} from "@/lib/company-info";
import type { ProcessedCompanyData } from "@/types/job";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

interface CompanyLogoInnerProps {
  companyData: ProcessedCompanyData;
  faviconSizePx: number;
  containerClassName: string;
  imageClassName: string;
  fallbackClassName: string;
}

const CompanyLogoInner = memo(({
  companyData,
  faviconSizePx,
  containerClassName,
  imageClassName,
  fallbackClassName,
}: CompanyLogoInnerProps) => {
  const faviconSrc = useMemo(() => {
    const domain = extractDomainFromCompanyWebsite(companyData.website);
    return domain ? companyFaviconUrl(domain, faviconSizePx) : null;
  }, [companyData.website, faviconSizePx]);

  const srcChain = useMemo(() => {
    const chain: string[] = [];
    if (faviconSrc) chain.push(faviconSrc);
    if (companyData.image_url && companyData.image_url !== faviconSrc) {
      chain.push(companyData.image_url);
    }
    return chain;
  }, [faviconSrc, companyData.image_url]);

  const [chainIndex, setChainIndex] = useState(0);

  useEffect(() => {
    setChainIndex(0);
  }, [srcChain.join("|")]);

  const activeSrc = chainIndex < srcChain.length ? srcChain[chainIndex] : undefined;
  const showImage = activeSrc !== undefined;

  const handleImageError = useCallback(() => {
    setChainIndex((i) => i + 1);
  }, []);

  const [backgroundType, setBackgroundType] = useState<"light" | "dark" | null>(null);

  const abbreviation = useMemo(() =>
    getCompanyAbbreviation(companyData.name || ""),
    [companyData.name]
  );

  const initialsContent = useMemo(() =>
    renderCompanyAbbreviationGrid(abbreviation, false),
    [abbreviation]
  );

  const imageUrlForAnalysis =
    showImage && activeSrc === companyData.image_url ? companyData.image_url : null;

  useEffect(() => {
    if (imageUrlForAnalysis) {
      analyzeImageBackground(imageUrlForAnalysis).then(setBackgroundType);
    } else {
      setBackgroundType(null);
    }
  }, [imageUrlForAnalysis]);

  const backgroundClass = useMemo(() =>
    getImageBackgroundClass(imageUrlForAnalysis, !showImage, backgroundType),
    [imageUrlForAnalysis, showImage, backgroundType]
  );

  const finalContainerClasses = useMemo(() =>
    `${containerClassName} ${backgroundClass}`,
    [containerClassName, backgroundClass]
  );

  const logoContent = useMemo(() => (
    <>
      {showImage ? (
        <img
          alt={companyData.name}
          className={imageClassName}
          onError={handleImageError}
          src={activeSrc}
        />
      ) : (
        <span className={fallbackClassName}>
          {initialsContent}
        </span>
      )}
    </>
  ), [showImage, companyData.name, imageClassName, fallbackClassName, initialsContent, handleImageError, activeSrc]);

  return (
    <div className={finalContainerClasses}>
      {logoContent}
    </div>
  );
});

CompanyLogoInner.displayName = "CompanyLogoInner";

interface CompanyLogoProps {
  companyData: ProcessedCompanyData;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dialog" | "card";
  className?: string;
}

const CompanyLogo = memo(({
  companyData,
  size = "md",
  variant = "default",
  className = "",
}: CompanyLogoProps) => {
  const sizeClasses = {
    sm: "h-12",
    md: "h-14",
    lg: "h-24",
    xl: "h-32",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-md",
    lg: "text-3xl",
    xl: "text-3xl",
  };

  const paddingClasses = {
    sm: "p-0.5",
    md: "p-0.75",
    lg: "",
    xl: "",
  };

  const roundedClasses = {
    sm: "rounded",
    md: "rounded-[6px]",
    lg: "rounded-xl",
    xl: "rounded-xl",
  };

  const containerClasses = useMemo(() => {
    const baseClasses = `flex aspect-square flex-shrink-0 items-center justify-center overflow-hidden ${sizeClasses[size]} ${roundedClasses[size]} ${className}`;

    if (variant === "dialog") {
      return `${baseClasses} self-start`;
    }

    return baseClasses;
  }, [size, variant, className]);

  const imageClasses = useMemo(() => {
    const baseClasses = `h-full w-full object-contain ${roundedClasses[size]} ${paddingClasses[size]}`;

    if (variant === "dialog") {
      return `${baseClasses} drop-shadow-lg`;
    }

    return baseClasses;
  }, [size, variant]);

  const fallbackClasses = useMemo(() => {
    const baseClasses = `font-semibold text-primary dark:text-primary ${textSizes[size]}`;

    if (variant === "dialog") {
      return `flex h-full w-full select-none items-center justify-center bg-brand-soft ${baseClasses} dark:bg-brand-soft`;
    }

    return baseClasses;
  }, [size, variant]);

  const faviconSizePx = { sm: 64, md: 128, lg: 128, xl: 128 }[size];

  return (
    <CompanyLogoInner
      companyData={companyData}
      faviconSizePx={faviconSizePx}
      containerClassName={containerClasses}
      imageClassName={imageClasses}
      fallbackClassName={fallbackClasses}
    />
  );
});

CompanyLogo.displayName = "CompanyLogo";

export default CompanyLogo;
