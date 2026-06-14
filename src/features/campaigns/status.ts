// Human-language campaign status. Marketers do not think in "dispatching".
export const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  draft: "Not sent",
  dispatching: "Sending",
  active: "Sent",
  completed: "Done",
};

export const CAMPAIGN_STATUS_VARIANT: Record<
  string,
  "secondary" | "warning" | "info" | "success"
> = {
  draft: "secondary",
  dispatching: "warning",
  active: "info",
  completed: "success",
};

export function campaignStatusLabel(status: string | null | undefined): string {
  if (!status) return "Not sent";
  return CAMPAIGN_STATUS_LABEL[status] ?? status;
}
