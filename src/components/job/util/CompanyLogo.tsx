import {
  analyzeImageBackground,
  cleanDomain,
  companyFaviconUrl,
  extractDomainFromCompanyWebsite,
  getCompanyAbbreviation,
  getCompanyLogoSources,
  isExpandableLogo,
  isFaviconServiceUrl,
  renderCompanyAbbreviationGrid,
} from "@/lib/company-info";
import type { ProcessedCompanyData } from "@/types/job";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "list" | "lg" | "xl";
type LogoVariant = "default" | "dialog" | "card" | "inbox";

interface CompanyLogoInnerProps {
  companyData: ProcessedCompanyData;
  faviconSizePx: number;
  containerClassName: string;
  imageClassName: string;
  fallbackClassName: string;
  imageAlt: string;
  size: LogoSize;
  transparentBackground?: boolean;
}

const CompanyLogoInner = memo(
  ({ companyData, faviconSizePx, containerClassName, imageClassName, fallbackClassName, imageAlt, size, transparentBackground = false }: CompanyLogoInnerProps) => {
    const srcChain = useMemo(() => {
      // Enable favicon fallbacks across all sizes (including list cards) so companies
      // with only favicon assets (e.g. Lockheed Martin) render reliably instead of falling back to initials.
      const includeFavicons = true;
      return getCompanyLogoSources(companyData, faviconSizePx, { includeFavicons });
    }, [companyData.image_url, companyData.canonical_domain, companyData.website, faviconSizePx, size]);

    const [chainIndex, setChainIndex] = useState(0);

    useEffect(() => {
      setChainIndex(0);
    }, [srcChain.join("|")]);

    const activeSrc = chainIndex < srcChain.length ? srcChain[chainIndex] : undefined;
    const showImage = activeSrc !== undefined;

    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
      setImageLoaded(false);
    }, [activeSrc]);

    const minDimension = useMemo(() => {
      switch (size) {
        case "sm":
          return 36;
        case "md":
        case "list":
          return 44;
        case "lg":
        case "xl":
        default:
          return 64;
      }
    }, [size]);

    const validateAndProcessImage = useCallback(
      (img: HTMLImageElement) => {
        const { naturalWidth, naturalHeight } = img;
        const isSvg = Boolean(activeSrc && (/\.svg(\?|$)/i.test(activeSrc) || activeSrc.startsWith("data:image/svg+xml")));
        const isFavicon = Boolean(activeSrc && isFaviconServiceUrl(activeSrc));

        if (isFavicon) {
          // Favicon fallbacks: accept valid decoded icons with a reasonable aspect ratio
          if (naturalWidth > 0 && naturalHeight > 0) {
            const aspectRatio = naturalWidth / naturalHeight;
            if (aspectRatio >= 0.5 && aspectRatio <= 2.0) {
              setImageLoaded(true);
              return;
            }
          }
          setChainIndex((i) => i + 1);
          return;
        }

        // Verify that primary logo candidates can properly expand and fill the square slot without
        // unsightly letterboxing, tiny low-res pixelation, or broken decodes.
        const expandable = isExpandableLogo(naturalWidth, naturalHeight, {
          minDimension,
          minAspectRatio: 0.75,
          maxAspectRatio: 1.35,
          src: activeSrc,
          isSvg,
        });

        if (!expandable) {
          // Fall back to next source or monogram UI
          setChainIndex((i) => i + 1);
          return;
        }

        setImageLoaded(true);
      },
      [activeSrc, minDimension]
    );

    const handleImageLoad = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        validateAndProcessImage(e.currentTarget);
      },
      [validateAndProcessImage]
    );

    const handleImageError = useCallback(() => {
      setChainIndex((i) => i + 1);
    }, []);

    const imgRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
      if (imgRef.current?.complete && activeSrc) {
        validateAndProcessImage(imgRef.current);
      }
    }, [activeSrc, validateAndProcessImage]);

    const [backgroundType, setBackgroundType] = useState<"light" | "dark" | null>(null);

    const abbreviation = useMemo(() => getCompanyAbbreviation(companyData.name || companyData.canonical_domain || "") || "?", [companyData.name, companyData.canonical_domain]);

    const initialsContent = useMemo(() => renderCompanyAbbreviationGrid(abbreviation, false), [abbreviation]);

    const imageUrlForAnalysis = showImage && activeSrc === companyData.image_url ? companyData.image_url : null;

    useEffect(() => {
      if (imageUrlForAnalysis) {
        analyzeImageBackground(imageUrlForAnalysis).then(setBackgroundType);
      } else {
        setBackgroundType(null);
      }
    }, [imageUrlForAnalysis]);

    const backgroundClass = useMemo(() => {
      if (!showImage) return "bg-brand-soft/50";
      if (transparentBackground) return "";
      if (backgroundType === "light") return "dark:bg-card";
      if (backgroundType === "dark") return "dark:bg-background";
      return "";
    }, [showImage, backgroundType, transparentBackground]);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [squareStyle, setSquareStyle] = useState<React.CSSProperties | undefined>(undefined);

    useIsomorphicLayoutEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const enforceSquare = () => {
        const rect = el.getBoundingClientRect();
        const w = Math.round(rect.width);
        const h = Math.round(rect.height);
        if (w > 0 && h > 0 && w !== h) {
          const side = Math.min(w, h);
          setSquareStyle({ width: `${side}px`, height: `${side}px` });
        }
      };

      enforceSquare();

      const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(enforceSquare) : null;
      ro?.observe(el);
      return () => ro?.disconnect();
    }, []);

    const finalContainerClasses = useMemo(() => {
      // Strip self-stretch so the container never stretches out of aspect-square along flex cross-axis
      const cleanedContainer = containerClassName.replace(/\bself-stretch\b/g, "").trim();
      return cn(cleanedContainer, backgroundClass);
    }, [containerClassName, backgroundClass]);

    // An empty alt marks the logo as decorative, so the company name is announced by the adjacent text instead of twice.
    const isDecorative = imageAlt.length === 0;

    const logoContent = useMemo(
      () => (
        <>
          {showImage ? (
            <>
              {!imageLoaded && <Skeleton className="absolute inset-0 aspect-square h-full w-full" />}
              <img
                ref={imgRef}
                alt={imageAlt}
                className={`${imageClassName} transition-opacity duration-200 ease-out ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                decoding="async"
                loading="lazy"
                onError={handleImageError}
                onLoad={handleImageLoad}
                src={activeSrc}
              />
            </>
          ) : (
            <span aria-hidden={isDecorative ? true : undefined} className={`${fallbackClassName} animate-in fade-in-0 duration-200`}>
              {initialsContent}
            </span>
          )}
        </>
      ),
      [showImage, imageAlt, isDecorative, imageClassName, fallbackClassName, initialsContent, handleImageError, handleImageLoad, activeSrc, imageLoaded]
    );

    return (
      <div ref={containerRef} className={finalContainerClasses} style={squareStyle}>
        {logoContent}
      </div>
    );
  }
);

CompanyLogoInner.displayName = "CompanyLogoInner";

interface CompanyLogoProps {
  companyData: ProcessedCompanyData;
  size?: LogoSize;
  variant?: LogoVariant;
  className?: string;
  imageClassName?: string;
  faviconSizePx?: number;
  /**
   * Accessible name of the logo image. Defaults to an empty alt, which renders the logo as decorative because every
   * consumer renders the company name as adjacent text. Pass a name only when the logo is the sole carrier of it.
   */
  alt?: string;
}

const CompanyLogo = memo(
  ({ companyData, size = "md", variant = "default", className = "", imageClassName = "", faviconSizePx: customFaviconSizePx, alt = "" }: CompanyLogoProps) => {
    const sizeClasses = {
      sm: "size-12",
      md: "size-14",
      /** List-row logos: sized to match the company and job title header row height. */
      list: "aspect-square size-14 shrink-0",
      lg: "size-24",
      xl: "size-32",
    };

    const textSizes = {
      sm: "text-sm",
      md: "text-md",
      list: "text-md font-semibold",
      lg: "text-3xl",
      xl: "text-3xl",
    };

    const paddingClasses = {
      sm: "p-0.5",
      md: "p-0.75",
      list: "p-0.75",
      lg: "",
      xl: "",
    };

    const roundedClasses = {
      sm: "rounded",
      md: "rounded-[6px]",
      list: "rounded-[6px]",
      lg: "rounded-xl",
      xl: "rounded-xl",
    };

    const containerClasses = useMemo(() => {
      return cn(
        "relative flex aspect-square flex-shrink-0 items-center justify-center overflow-hidden bg-transparent",
        variant === "inbox" ? "size-10 rounded-md" : sizeClasses[size],
        variant === "inbox" ? "rounded-md" : roundedClasses[size],
        variant === "dialog" && "self-start",
        className
      );
    }, [size, variant, className]);

    const imageClasses = useMemo(() => {
      const padding = variant === "inbox" ? "p-0" : paddingClasses[size];
      const baseClasses = cn("h-full w-full object-contain", variant === "inbox" ? "rounded-md" : roundedClasses[size], padding, imageClassName);

      if (variant === "dialog") {
        return `${baseClasses} drop-shadow-lg`;
      }

      return baseClasses;
    }, [size, variant, imageClassName]);

    const fallbackClasses = useMemo(() => {
      const baseClasses = `font-semibold text-primary ${textSizes[size]}`;

      if (variant === "dialog") {
        return `flex h-full w-full select-none items-center justify-center ${baseClasses}`;
      }

      return baseClasses;
    }, [size, variant]);

    const defaultFaviconSizePx = variant === "inbox" ? 256 : { sm: 128, md: 128, list: 128, lg: 256, xl: 256 }[size];
    const faviconSizePx = customFaviconSizePx ?? defaultFaviconSizePx;

    return (
      <CompanyLogoInner
        companyData={companyData}
        size={size}
        faviconSizePx={faviconSizePx}
        containerClassName={containerClasses}
        imageClassName={imageClasses}
        fallbackClassName={fallbackClasses}
        imageAlt={alt}
        transparentBackground={variant === "inbox"}
      />
    );
  }
);

CompanyLogo.displayName = "CompanyLogo";

export default CompanyLogo;
