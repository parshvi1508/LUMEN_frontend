// Human-language campaign status. Marketers do not think in "dispatching".
export const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  draft: "Not sent",
  dispatching: "Sending",
  active: "Live",
  completed: "Done",
};

export const CAMPAIGN_STATUS_HINT: Record<string, string> = {
  draft: "Created but not yet dispatched.",
  dispatching: "Messages are being queued to the channel.",
  active: "Messages delivered, watching for opens and conversions.",
  completed: "All messages processed. Final stats are in.",
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

export function campaignStatusHint(status: string | null | undefined): string {
  if (!status) return "";
  return CAMPAIGN_STATUS_HINT[status] ?? "";
}
