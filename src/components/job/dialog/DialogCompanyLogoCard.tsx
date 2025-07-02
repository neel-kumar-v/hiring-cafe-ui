import React, { useState } from "react";
import { MorphingCompanyLogo } from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { V5ProcessedCompanyData } from "@/types/jobs";

function getCompanyAbbreviation(companyName: string) {
	if (!companyName) return "";
	return companyName
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
}

function renderCompanyAbbreviationGrid(companyName: string) {
	if (companyName.length !== 4) return companyName;
	const letters = companyName.split("").map((letter) => letter.toUpperCase());
	return (
		<span className="inline-grid grid-cols-2 grid-rows-2 gap-x-0.5">
			<span className="font-bold">{letters[0]}</span>
			<span className="font-bold">{letters[1]}</span>
			<span className="font-bold">{letters[2]}</span>
			<span className="font-bold">{letters[3]}</span>
		</span>
	);
}

const DialogCompanyLogoCard = ({
	companyData,
}: {
	companyData: V5ProcessedCompanyData;
}) => {
	const [imageError, setImageError] = useState(false);
	const abbreviation = getCompanyAbbreviation(companyData.name || "");
	const initialsContent = renderCompanyAbbreviationGrid(abbreviation);
	const isDesktop = useMediaQuery("(min-width: 640px)");

	return (
		<div className="my-4 hidden min-h-[120px] items-center gap-8 sm:flex">
			{isDesktop ? (
				<MorphingCompanyLogo
					className={`flex aspect-square h-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-gray-900 ${
						companyData.image_url && !imageError
							? ""
							: " bg-pink-100 dark:bg-pink-800/15"
					}`}
				>
					{companyData.image_url && !imageError ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							alt={companyData.name}
							className="h-full w-full rounded-xl object-contain drop-shadow-lg"
							onError={() => setImageError(true)}
							src={companyData.image_url}
						/>
					) : (
						<span className="flex h-full w-full select-none items-center justify-center bg-pink-100 font-semibold text-3xl text-pink-600 dark:bg-pink-800/15 dark:text-pink-300">
							{initialsContent}
						</span>
					)}
				</MorphingCompanyLogo>
			) : (
				<div
					className={`flex aspect-square h-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-gray-900 ${
						companyData.image_url && !imageError
							? ""
							: " bg-pink-100 dark:bg-pink-800/15"
					}`}
				>
					{companyData.image_url && !imageError ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							alt={companyData.name}
							className="h-full w-full rounded-xl object-contain drop-shadow-lg"
							onError={() => setImageError(true)}
							src={companyData.image_url}
						/>
					) : (
						<span className="flex h-full w-full select-none items-center justify-center bg-pink-100 font-semibold text-5xl text-pink-600 md:text-3xl dark:bg-pink-800/15 dark:text-pink-300">
							{initialsContent}
						</span>
					)}
				</div>
			)}
			<div className="flex h-full min-w-0 flex-1 flex-col justify-center">
				<p className="line-clamp-5 break-words text-gray-700 md:text-base md:leading-relaxed dark:text-gray-300">
					{companyData.tagline || (
						<span className="text-gray-400 italic">
							No description provided.
						</span>
					)}
					<span className="ml-2 p-0 text-pink-800 text-sm hover:underline md:text-base dark:text-pink-300">
						Show more company info
					</span>
				</p>
			</div>
		</div>
	);
};

export default DialogCompanyLogoCard;
