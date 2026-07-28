import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildPromotionLink, buildShopifyCartPermalink, resolveCampaignAttribution } from "../app/commerce.mjs";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the customer catalog without internal operations UI", async () => {
  const response = await render("/?ref=test-campaign");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /ORIGI 原界/);
  assert.match(html, /让热爱，/);
  assert.match(html, /ART TOY · SCALE FIGURE/);
  assert.match(html, /先选 IP，/);
  assert.match(html, /再选款式/);
  assert.match(html, /IP DIRECTORY \/ CHOOSE YOUR WORLD/);
  assert.match(html, /购物袋/);
  assert.doesNotMatch(html, /角色档案|全部角色|选择角色|按角色选购|按 IP \/ 角色选购|从种草，到安全支付|生成可追踪推广链接|推广归因|已按具体 SKU 核验|203 个商品合集|按 IP · 角色 · 款式分类/);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working/);
});

test("keeps checkout limited to exact Shopify variants with verified prices", async () => {
  const [catalogText, variantMapText, pageSource, commerceSource] = await Promise.all([
    readFile(new URL("../app/jd-products.json", import.meta.url), "utf8"),
    readFile(new URL("../app/shopify-variants.json", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/commerce.mjs", import.meta.url), "utf8"),
  ]);
  const catalog = JSON.parse(catalogText);
  const variantMap = JSON.parse(variantMapText);
  const variants = catalog.flatMap((collection) => collection.variants ?? []);
  const bySku = new Map(variants.map((variant) => [String(variant.skuId), variant]));

  assert.equal(Object.keys(variantMap).length, 4);
  for (const [sku, shopifyVariantId] of Object.entries(variantMap)) {
    const variant = bySku.get(sku);
    assert.ok(variant, `catalog is missing mapped SKU ${sku}`);
    assert.equal(variant.priceStatus, "verified", `mapped SKU ${sku} is not verified`);
    assert.ok(Number(variant.price) > 0, `mapped SKU ${sku} has no positive price`);
    assert.match(shopifyVariantId, /^\d+$/);
  }

  assert.match(commerceSource, /mqzvqg-1b\.myshopify\.com/);
  assert.match(pageSource, /前往安全结算/);
  assert.match(pageSource, /buildShopifyCartPermalink/);
  assert.doesNotMatch(pageSource, /PROMOTION LINK BUILDER|生成可追踪推广链接|订单推广来源/);
  assert.match(commerceSource, /attributes\[推广来源\]/);
  assert.match(commerceSource, /attributes\[UTM Source\]/);
  assert.match(commerceSource, /attributes\[UTM Medium\]/);
  assert.match(commerceSource, /attributes\[UTM Campaign\]/);
  assert.match(pageSource, /params\.get\("discount"\)/);
});

test("generates promotion links and carries attribution into Shopify checkout", () => {
  const promotionUrl = new URL(buildPromotionLink({
    source: "小红书 Lucy",
    medium: "creator",
    campaign: "暑期 手办",
    discount: " origi 10 ",
  }));
  assert.equal(promotionUrl.origin, "https://uncle-jacking.github.io");
  assert.equal(promotionUrl.searchParams.get("ref"), "小红书-Lucy");
  assert.equal(promotionUrl.searchParams.get("utm_source"), "小红书-Lucy");
  assert.equal(promotionUrl.searchParams.get("utm_medium"), "creator");
  assert.equal(promotionUrl.searchParams.get("utm_campaign"), "暑期-手办");
  assert.equal(promotionUrl.searchParams.get("discount"), "ORIGI10");

  const stored = JSON.stringify({ ref: "old", utmSource: "old-source", utmMedium: "affiliate", utmCampaign: "old-campaign" });
  const attribution = resolveCampaignAttribution("?ref=lucy&utm_source=xhs&utm_medium=creator&utm_campaign=launch", stored);
  assert.deepEqual(attribution, { ref: "lucy", utmSource: "xhs", utmMedium: "creator", utmCampaign: "launch" });
  assert.equal(resolveCampaignAttribution("", "legacy-ref").ref, "legacy-ref");

  const checkoutUrl = new URL(buildShopifyCartPermalink([
    { variantId: "49276602384643", quantity: 2 },
    { variantId: "49276601893123", quantity: 1 },
  ], " origi 10 ", attribution));
  assert.equal(checkoutUrl.origin, "https://mqzvqg-1b.myshopify.com");
  assert.equal(checkoutUrl.pathname, "/cart/49276602384643:2,49276601893123:1");
  assert.equal(checkoutUrl.searchParams.get("discount"), "ORIGI10");
  assert.equal(checkoutUrl.searchParams.get("ref"), "lucy");
  assert.equal(checkoutUrl.searchParams.get("attributes[推广来源]"), "lucy");
  assert.equal(checkoutUrl.searchParams.get("attributes[UTM Source]"), "xhs");
  assert.equal(checkoutUrl.searchParams.get("attributes[UTM Medium]"), "creator");
  assert.equal(checkoutUrl.searchParams.get("attributes[UTM Campaign]"), "launch");
  assert.throws(() => buildShopifyCartPermalink([{ variantId: "bad", quantity: 1 }], "", attribution), /Invalid Shopify variant ID/);
});
