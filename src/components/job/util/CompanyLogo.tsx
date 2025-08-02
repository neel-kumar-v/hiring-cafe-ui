import { MorphingCompanyLogo } from "@/components/ui/motion/morphing-dialog";
import { useReducedMotion } from "@/contexts/ReducedMotionContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  analyzeImageBackground,
  getCompanyAbbreviation,
  getImageBackgroundClass,
  renderCompanyAbbreviationGrid,
} from "@/lib/company-info";
import type { V5ProcessedCompanyData } from "@/types/job";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

interface CompanyLogoInnerProps {
  companyData: V5ProcessedCompanyData;
  containerClassName: string;
  imageClassName: string;
  fallbackClassName: string;
  useMorphing: boolean;
}

const CompanyLogoInner = memo(({
  companyData,
  containerClassName,
  imageClassName,
  fallbackClassName,
  useMorphing,
}: CompanyLogoInnerProps) => {
  const [imageError, setImageError] = useState(false);
  const [backgroundType, setBackgroundType] = useState<"light" | "dark" | null>(null);
  const isDesktop = useMediaQuery("(min-width: 728px)");
  const { prefersReducedMotion } = useReducedMotion();

  const abbreviation = useMemo(() => 
    getCompanyAbbreviation(companyData.name || ""), 
    [companyData.name]
  );

  const initialsContent = useMemo(() => 
    renderCompanyAbbreviationGrid(abbreviation, false), 
    [abbreviation]
  );

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  useEffect(() => {
    if (companyData.image_url && !imageError) {
      analyzeImageBackground(companyData.image_url).then(setBackgroundType);
    }
  }, [companyData.image_url, imageError]);

  const backgroundClass = useMemo(() => 
    getImageBackgroundClass(companyData.image_url, imageError, backgroundType),
    [companyData.image_url, imageError, backgroundType]
  );

  const finalContainerClasses = useMemo(() => 
    `${containerClassName} ${backgroundClass}`,
    [containerClassName, backgroundClass]
  );

  const logoContent = useMemo(() => (
    <>
      {companyData.image_url && !imageError ? (
        <img
          alt={companyData.name}
          className={imageClassName}
          onError={handleImageError}
          src={companyData.image_url}
        />
      ) : (
        <span className={fallbackClassName}>
          {initialsContent}
        </span>
      )}
    </>
  ), [companyData.image_url, companyData.name, imageError, imageClassName, fallbackClassName, initialsContent, handleImageError]);

  const shouldUseMorphing = useMorphing && isDesktop && !prefersReducedMotion;

  if (shouldUseMorphing) {
    return (
      <MorphingCompanyLogo className={finalContainerClasses}>
        {logoContent}
      </MorphingCompanyLogo>
    );
  }

  return (
    <div className={finalContainerClasses}>
      {logoContent}
    </div>
  );
});

CompanyLogoInner.displayName = "CompanyLogoInner";

interface CompanyLogoProps {
  companyData: V5ProcessedCompanyData;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dialog" | "card";
  className?: string;
  useMorphing?: boolean;
}

const CompanyLogo = ({
  companyData,
  size = "md",
  variant = "default",
  className = "",
  useMorphing = true,
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
    const baseClasses = `font-semibold text-pink-600 dark:text-pink-300 ${textSizes[size]}`;
    
    if (variant === "dialog") {
      return `flex h-full w-full select-none items-center justify-center bg-pink-100 ${baseClasses} dark:bg-pink-800/15`;
    }
    
    return baseClasses;
  }, [size, variant]);

  return (
    <CompanyLogoInner
      companyData={companyData}
      containerClassName={containerClasses}
      imageClassName={imageClasses}
      fallbackClassName={fallbackClasses}
      useMorphing={useMorphing}
    />
  );
};

export default CompanyLogo; 