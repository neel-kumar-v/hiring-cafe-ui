import { ExternalLink, Link2 } from "lucide-react";
import React, { useState } from "react";
import {
	MorphingCompanyLogo,
	MorphingCompanyName,
} from "@/components/ui/morphing-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
	formatCompanyName,
	getCompanyAbbreviation,
	renderCompanyAbbreviationGrid,
} from "@/lib/utils";
import type { V5ProcessedCompanyData } from "@/types/jobs";
import UniversalTooltip from "../../util/UniversalTooltip";

const CardCompanyInfo = ({
	companyData,
}: {
	companyData: V5ProcessedCompanyData;
}) => {
	const [imageError, setImageError] = useState(false);
	const isDesktop = useMediaQuery("(min-width: 640px)");

	return (
		<div className="group mb-3 flex items-start space-x-2">
			{isDesktop ? (
				<MorphingCompanyLogo
					className={`flex aspect-square h-14 flex-shrink-0 items-center justify-center rounded overflow-hidden${
						companyData.image_url && !imageError
							? ""
							: " bg-pink-100 dark:bg-pink-800/15"
					}`}
				>
					{companyData.image_url && !imageError ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							alt={companyData.name}
							className="h-full w-full rounded-[6px] object-contain p-0.75"
							onError={() => setImageError(true)}
							src={companyData.image_url}
						/>
					) : (
						<span className="font-semibold text-md text-pink-600 dark:text-pink-300">
							{renderCompanyAbbreviationGrid(
								getCompanyAbbreviation(companyData.name || "")
							)}
						</span>
					)}
				</MorphingCompanyLogo>
			) : (
				<div
					className={`flex aspect-square h-14 flex-shrink-0 items-center justify-center rounded overflow-hidden${
						companyData.image_url && !imageError
							? ""
							: " bg-pink-100 dark:bg-pink-800/15"
					}`}
				>
					{companyData.image_url && !imageError ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							alt={companyData.name}
							className="h-full w-full rounded-[6px] object-contain p-0.75"
							onError={() => setImageError(true)}
							src={companyData.image_url}
						/>
					) : (
						<span className="font-semibold text-md text-pink-600 dark:text-pink-300">
							{renderCompanyAbbreviationGrid(
								getCompanyAbbreviation(companyData.name || "")
							)}
						</span>
					)}
				</div>
			)}
			<div className="min-w-0 flex-1">
				<div className="overflow-visible whitespace-nowrap rounded group-hover:w-fit group-hover:backdrop-blur-xl">
					{companyData.name ? (
						<>
							<UniversalTooltip content="Visit company site">
								<a
									className="line-clamp-1 inline-flex w-fit items-center font-medium text-gray-900 text-sm hover:underline dark:text-white"
									href={
										companyData.website
											? companyData.website.startsWith("http")
												? companyData.website
												: `https://${companyData.website}`
											: "#"
									}
									onClick={(e) => {
										e.stopPropagation();
									}}
									rel="noopener noreferrer"
									style={{ overflow: "visible" }}
									tabIndex={0}
									target="_blank"
								>
									<span
										aria-hidden="true"
										className="-translate-x-3 -mr-3 group-hover:-mr-1 flex items-center opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
									>
										<Link2 className="-rotate-45 size-3 text-gray-400 dark:text-gray-300" />
									</span>
									<MorphingCompanyName className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-2">
										{formatCompanyName(companyData.name)}
									</MorphingCompanyName>
								</a>
							</UniversalTooltip>
							<UniversalTooltip
								content={`View all jobs from ${companyData.name}`}
							>
								<div
									className="ml-2 inline-flex h-auto items-center gap-1 p-1 font-normal text-gray-500 text-xs leading-none opacity-0 transition-all duration-200 hover:underline group-hover:ml-4 group-hover:opacity-100 dark:text-pink-400 dark:hover:text-pink-300"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										// Handle view all jobs logic here
									}}
								>
									<ExternalLink className="size-3 text-gray-400 dark:text-gray-300" />
									View All
								</div>
							</UniversalTooltip>
						</>
					) : isDesktop ? (
						<MorphingCompanyName className="line-clamp-1 inline-flex w-fit items-center font-medium text-gray-900 text-sm transition-all duration-200 dark:text-white">
							{formatCompanyName(companyData.name)}
						</MorphingCompanyName>
					) : (
						<span className="line-clamp-1 inline-flex w-fit items-center font-medium text-gray-900 text-sm transition-all duration-200 dark:text-white">
							{formatCompanyName(companyData.name)}
						</span>
					)}
				</div>

				<div className="line-clamp-2 cursor-text text-gray-600 text-xs dark:text-gray-400">
					{companyData.tagline}
				</div>
			</div>
		</div>
	);
};

export default CardCompanyInfo;
