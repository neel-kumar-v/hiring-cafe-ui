import React from "react";

const DialogCompanyDescription = ({ tagline }: { tagline: string }) => {
	if (!tagline) return null;

	return (
		<div className="mb-6 ">
			<h4 className="mb-2 font-medium text-gray-900 text-lg dark:text-white">
				Company Description
			</h4>
			<p className="text-gray-700 leading-relaxed dark:text-gray-300">
				{tagline}
			</p>
		</div>
	);
};

export default DialogCompanyDescription;
