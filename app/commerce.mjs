export const shopifyCheckoutOrigin = "https://mqzvqg-1b.myshopify.com";
export const publicStoreOrigin = "https://uncle-jacking.github.io/";

export const defaultCampaignAttribution = Object.freeze({
  ref: "origi-storefront",
  utmSource: "direct",
  utmMedium: "storefront",
  utmCampaign: "always-on",
});

export function normalizeTrackingValue(value, fallback = "") {
  const normalized = String(value || "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80);
  return normalized || fallback;
}

export function trackingToken(value, fallback) {
  return normalizeTrackingValue(value, fallback)
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}._-]/gu, "")
    .slice(0, 80) || fallback;
}

export function normalizeDiscountCode(value) {
  return String(value || "").trim().replace(/\s+/g, "").slice(0, 64).toUpperCase();
}

export function readStoredAttribution(rawValue) {
  if (!rawValue) return { ...defaultCampaignAttribution };

  try {
    const parsed = JSON.parse(rawValue);
    if (typeof parsed === "string") {
      return {
        ...defaultCampaignAttribution,
        ref: normalizeTrackingValue(parsed, defaultCampaignAttribution.ref),
      };
    }
    if (parsed && typeof parsed === "object") {
      return {
        ref: normalizeTrackingValue(parsed.ref, defaultCampaignAttribution.ref),
        utmSource: normalizeTrackingValue(parsed.utmSource, defaultCampaignAttribution.utmSource),
        utmMedium: normalizeTrackingValue(parsed.utmMedium, defaultCampaignAttribution.utmMedium),
        utmCampaign: normalizeTrackingValue(parsed.utmCampaign, defaultCampaignAttribution.utmCampaign),
      };
    }
  } catch {
    return {
      ...defaultCampaignAttribution,
      ref: normalizeTrackingValue(rawValue, defaultCampaignAttribution.ref),
    };
  }

  return { ...defaultCampaignAttribution };
}

export function resolveCampaignAttribution(search, storedRawValue = "") {
  const stored = readStoredAttribution(storedRawValue);
  const params = new URLSearchParams(search);
  const incomingRef = params.get("ref");
  const incomingSource = params.get("utm_source");
  const incomingMedium = params.get("utm_medium");
  const incomingCampaign = params.get("utm_campaign");
  const hasIncoming = Boolean(incomingRef || incomingSource || incomingMedium || incomingCampaign);

  if (!hasIncoming) return stored;

  return {
    ref: normalizeTrackingValue(incomingRef || incomingSource, stored.ref),
    utmSource: normalizeTrackingValue(incomingSource || incomingRef, stored.utmSource),
    utmMedium: normalizeTrackingValue(incomingMedium, stored.utmMedium),
    utmCampaign: normalizeTrackingValue(incomingCampaign, stored.utmCampaign),
  };
}

export function buildPromotionLink({ source, medium, campaign, discount = "" }) {
  const url = new URL(publicStoreOrigin);
  const normalizedSource = trackingToken(source, "partner");
  url.searchParams.set("ref", normalizedSource);
  url.searchParams.set("utm_source", normalizedSource);
  url.searchParams.set("utm_medium", trackingToken(medium, "creator"));
  url.searchParams.set("utm_campaign", trackingToken(campaign, "figure-launch"));
  const code = normalizeDiscountCode(discount);
  if (code) url.searchParams.set("discount", code);
  return url.toString();
}

export function buildShopifyCartPermalink(lines, discount, attribution) {
  const linePath = lines.map(({ variantId, quantity }) => {
    const normalizedVariantId = String(variantId || "");
    if (!/^\d+$/.test(normalizedVariantId)) throw new Error("Invalid Shopify variant ID");
    const normalizedQuantity = Math.max(1, Math.min(99, Math.floor(Number(quantity) || 1)));
    return `${normalizedVariantId}:${normalizedQuantity}`;
  }).join(",");

  if (!linePath) throw new Error("A checkout requires at least one Shopify variant");

  const url = new URL(`/cart/${linePath}`, shopifyCheckoutOrigin);
  const code = normalizeDiscountCode(discount);
  if (code) url.searchParams.set("discount", code);
  url.searchParams.set("ref", normalizeTrackingValue(attribution.ref, defaultCampaignAttribution.ref));
  url.searchParams.set("attributes[推广来源]", normalizeTrackingValue(attribution.ref, defaultCampaignAttribution.ref));
  url.searchParams.set("attributes[UTM Source]", normalizeTrackingValue(attribution.utmSource, defaultCampaignAttribution.utmSource));
  url.searchParams.set("attributes[UTM Medium]", normalizeTrackingValue(attribution.utmMedium, defaultCampaignAttribution.utmMedium));
  url.searchParams.set("attributes[UTM Campaign]", normalizeTrackingValue(attribution.utmCampaign, defaultCampaignAttribution.utmCampaign));
  return url.toString();
}
