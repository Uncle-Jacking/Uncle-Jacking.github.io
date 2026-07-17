import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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

test("renders the ORIGI catalog and commerce entry points", async () => {
  const response = await render("/?ref=test-campaign");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /ORIGI 原界/);
  assert.match(html, /从种草，到安全支付/);
  assert.match(html, /优惠码/);
  assert.match(html, /推广归因/);
  assert.doesNotMatch(html, /Your site is taking shape|Codex is working/);
});

test("keeps checkout limited to exact Shopify variants with verified prices", async () => {
  const [catalogText, variantMapText, pageSource] = await Promise.all([
    readFile(new URL("../app/jd-products.json", import.meta.url), "utf8"),
    readFile(new URL("../app/shopify-variants.json", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
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

  assert.match(pageSource, /mqzvqg-1b\.myshopify\.com/);
  assert.match(pageSource, /前往安全结算/);
  assert.match(pageSource, /params\.set\("discount", code\)/);
  assert.match(pageSource, /params\.set\("ref", campaignRef/);
  assert.match(pageSource, /attributes\[来源\]/);
});
