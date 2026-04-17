export interface GeoLoc {
	lat: number;
	lon: number;
}

export interface JobInformation {
	title: string;
	description: string;
	job_title_raw?: string;
	viewedByUsers?: string[];
	hiddenFromUsers?: string[];
	appliedFromUsers?: string[];
	savedFromUsers?: string[];
}

export interface CompensationRange {
	yearly_max_compensation: number | null;
	yearly_min_compensation: number | null;
	monthly_max_compensation: number | null;
	monthly_min_compensation: number | null;
	weekly_max_compensation: number | null;
	weekly_min_compensation: number | null;
	hourly_max_compensation: number | null;
	hourly_min_compensation: number | null;
	"bi-weekly_min_compensation": number | null;
	"bi-weekly_max_compensation": number | null;
	daily_min_compensation: number | null;
	daily_max_compensation: number | null;
}

export interface ProcessedJobData {
	core_job_title: string;
	requirements_summary: string;
	technical_tools: string[];
	licenses_or_certifications: string[];
	associates_degree_requirement: string;
	associates_degree_fields_of_study: string[];
	bachelors_degree_requirement: string;
	bachelors_degree_fields_of_study: string[];
	masters_degree_requirement: string;
	masters_degree_fields_of_study: string[];
	doctorate_degree_requirement: string;
	doctorate_degree_fields_of_study: string[];
	licenses_or_certifications_not_mentioned: boolean;
	min_industry_and_role_yoe: number | null;
	"401k_matching": boolean;
	is_min_industry_and_role_yoe_not_mentioned: boolean;
	min_management_and_leadership_yoe: number | null;
	is_min_management_and_leadership_yoe_not_mentioned: boolean;
	job_category: string;
	role_activities: string[];
	commitment: string[];
	role_type: string;
	seniority_level: string;
	workplace_countries: string[];
	boundless_workplace_states: string[];
	boundless_workplace_countries: string[];
	boundless_workplace_continents: string[];
	workplace_continents: string[];
	workplace_states: string[];
	workplace_cities: string[];
	workplace_counties: string[];
	workplace_type: string;
	workplace_physical_environment: string;
	oral_communication_level: string;
	physical_labor_intensity: string;
	physical_position: string;
	computer_usage: string;
	cognitive_demand: string;
	air_travel_requirement: string;
	land_travel_requirement: string;
	morning_shift_work: string;
	evening_shift_work: string;
	overnight_work: string;
	formatted_workplace_location: string;
	on_call_requirement: string;
	weekend_availability_required: boolean;
	holiday_availability_required: boolean;
	generous_paid_time_off: boolean;
	four_day_work_week: boolean;
	overtime_required: boolean;
	is_workplace_worldwide_ok: boolean;
	language_requirements: string[];
	num_language_requirements: number;
	yearly_max_compensation: number | null;
	yearly_min_compensation: number | null;
	monthly_max_compensation: number | null;
	monthly_min_compensation: number | null;
	weekly_max_compensation: number | null;
	weekly_min_compensation: number | null;
	hourly_max_compensation: number | null;
	hourly_min_compensation: number | null;
	"bi-weekly_min_compensation": number | null;
	"bi-weekly_max_compensation": number | null;
	daily_min_compensation: number | null;
	daily_max_compensation: number | null;
	estimated_publish_date: string; // Could also be Date
	fair_chance: boolean;
	visa_sponsorship: boolean;
	relocation_assistance: boolean;
	military_veterans: boolean;
	tuition_reimbursement: boolean;
	retirement_plan: boolean;
	generous_parental_leave: boolean;
	is_high_school_required: boolean;
	is_driver_license_required: boolean;
	is_compensation_transparent: boolean;
	listed_compensation_currency: string;
	listed_compensation_frequency: string;
	security_clearance: string;
	position_employer_type: string;
	company_name: string;
	company_website: string;
	company_sector_and_industry: string;
	company_activities: string[];
	company_tagline: string;
}

/** Company enrichment from API when the processed company block is omitted. */
export interface EnrichedCompanyData {
	activities?: string[];
	enriched_at?: string;
	homepage_uri?: string;
	hq_country?: string;
	industries?: string[];
	latest_funding_amount?: number | null;
	latest_funding_investors?: string | string[] | null;
	latest_funding_type?: string | null;
	latest_funding_year?: number | null;
	name?: string;
	nb_employees?: number;
	organization_type?: string;
	parent_company?: string;
	status?: string;
	stock_exchange?: string | null;
	stock_symbol?: string | null;
	subsidiaries?: string[];
	tagline?: string;
	year_founded?: number;
}

export interface ProcessedCompanyData {
	name: string;
	image_url: string;
	subsidiaries: string[];
	parent_company: string;
	website: string;
	linkedin_url: string;
	industries: string[];
	activities: string[];
	tagline: string;
	is_non_profit: boolean;
	is_public_company: boolean;
	is_dissolved: boolean;
	is_acquired: boolean;
	num_employees: number;
	year_founded: number;
	headquarters_country: string;
	total_funding_amount: number | null;
	total_funding_currency: string | null;
	latest_investment_amount: number | null;
	latest_investment_currency: string | null;
	latest_investment_year: number | null;
	latest_investment_series: string | null;
	investors: string[];
	stock_exchange: string | null;
	stock_symbol: string | null;
	latest_revenue: number | null;
	latest_revenue_currency: string | null;
	latest_revenue_year: number | null;
}

export interface Job {
	id: string;
	board_token: string;
	source: string;
	apply_url: string;
	source_and_board_token: string;
	job_information: JobInformation;
	processed_job_data: ProcessedJobData;
	/** Older scraped payloads; newer payloads may use `enriched_company_data` instead. */
	processed_company_data?: ProcessedCompanyData;
	enriched_company_data?: EnrichedCompanyData;
	collapse_key?: string;
	is_expired?: boolean;
	requisition_id?: string;
	_geoloc?: GeoLoc[];
	objectID: string;
	currentJobIndex: number;
}

export interface JobCollection {
	source_and_board_token: string;
	source: string;
	board_token: string;
	jobs: Job[];
}
