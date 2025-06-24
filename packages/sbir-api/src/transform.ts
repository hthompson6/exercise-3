export function mapSbirToDb(item: any) {
  return {
    solicitationId: item.solicitation_id,
    solicitationNumber: item.solicitation_number,
    title: item.solicitation_title,
    agency: item.agency,
    program: item.program,
    phase: item.phase,
    branch: item.branch,
    year: item.solicitation_year,
    releaseDate: item.release_date ? new Date(item.release_date) : undefined,
    openDate: item.open_date ? new Date(item.open_date) : undefined,
    closeDate: item.close_date ? new Date(item.close_date) : undefined,
    status: item.current_status,
    agencyUrl: item.solicitation_agency_url,
    rawJson: item,
  };
}