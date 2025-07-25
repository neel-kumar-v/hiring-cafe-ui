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

export const renderCompanyAbbreviationGrid = (companyName: string, dialog?: boolean) => {
  if (companyName.length !== 4) return companyName;
  const letters = companyName.split("").map((letter) => letter.toUpperCase());
  return (
    <span className={`inline-grid grid-cols-2 grid-rows-2 font-montserrat text-center font-bold ${dialog ? "gap-x-3 gap-y-2" : "gap-x-1"}`}>
      <span>{letters[0]}</span>
      <span>{letters[1]}</span>
      <span>{letters[2]}</span>
      <span>{letters[3]}</span>
    </span>
  );
};

// Memoized and cached version of analyzeImageBackground
const imageBackgroundCache = new Map<string, Promise<"light" | "dark" | null>>();

export const analyzeImageBackground = async (
  imageUrl: string
): Promise<"light" | "dark" | null> => {
  if (imageBackgroundCache.has(imageUrl)) {
    return imageBackgroundCache.get(imageUrl)!;
  }
  const promise = (async () => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      return await new Promise<"light" | "dark" | null>((resolve) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          let imageData: ImageData;
          try {
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          } catch {
            resolve(null);
            return;
          }
          const data = imageData.data;
          let totalPixels = 0;
          let transparentPixels = 0;
          let lightPixels = 0;
          let darkPixels = 0;
          for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha > 0) {
              totalPixels++;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const brightness = (r + g + b) / 3;
              if (brightness > 128) lightPixels++;
              else darkPixels++;
            } else transparentPixels++;
          }
          const transparencyRatio = transparentPixels / (totalPixels + transparentPixels);
          const hasSignificantTransparency = transparencyRatio > 0.3;
          if (!hasSignificantTransparency || totalPixels === 0) {
            resolve(null);
            return;
          }
          const lightRatio = lightPixels / totalPixels;
          const darkRatio = darkPixels / totalPixels;
          if (lightRatio > darkRatio) resolve("light");
          else resolve("dark");
        };
        img.onerror = () => {
          resolve(null);
        };
        img.src = imageUrl;
      });
    } catch (error) {
      console.warn("Failed to analyze image background:", error);
      return null;
    }
  })();
  imageBackgroundCache.set(imageUrl, promise);
  return promise;
};

export const getImageBackgroundClass = (
  imageUrl: string | null,
  imageError: boolean,
  backgroundType: "light" | "dark" | null
): string => {
  if (!imageUrl || imageError) {
    return "bg-pink-100 dark:bg-pink-800/15";
  }
  
  if (backgroundType === "light") {
    return "dark:bg-neutral-800";
  } else if (backgroundType === "dark") {
    return "dark:bg-white";
  }
  
  return "";
}; 