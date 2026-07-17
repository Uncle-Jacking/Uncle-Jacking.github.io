import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const artifactToolSpecifier = process.env.CODEX_ARTIFACT_TOOL_PATH || "@oai/artifact-tool";
const { SpreadsheetFile, Workbook } = await import(artifactToolSpecifier);

const root = fileURLToPath(new URL("../", import.meta.url));
const outputDir = path.join(root, "outputs", "019f6490-b5fb-7033-9fe5-2e68a444dfc3");
const previewDir = path.join(outputDir, "commerce-readiness-previews");
const outputPath = path.join(outputDir, "ORIGI-Shopify购买与推广准备表.xlsx");
const catalog = JSON.parse(await fs.readFile(path.join(root, "app", "jd-products.json"), "utf8"));
const mappedVariants = JSON.parse(await fs.readFile(path.join(root, "app", "shopify-variants.json"), "utf8"));

const collections = catalog.filter((item) => !/^运费差价/.test(item.title));
const verifiedVariants = collections.flatMap((collection) => collection.variants.flatMap((variant, index) => {
  const effectivePrice = Number(variant.finalPrice ?? variant.price);
  if (variant.priceStatus !== "verified" || !(effectivePrice > 0)) return [];
  return [{
    collectionSku: String(collection.sku),
    productTitle: collection.title,
    variantOrder: index + 1,
    skuId: String(variant.skuId || collection.sku),
    variantName: (variant.label || collection.title).trim(),
    salePrice: effectivePrice,
    compareAtPrice: Number(variant.finalPrice) > 0 && Number(variant.price) > Number(variant.finalPrice) ? Number(variant.price) : null,
    imageUrl: variant.image || collection.image,
    mappedVariantId: mappedVariants[String(variant.skuId || collection.sku)] || "",
    sourceUrl: `https://item.jd.com/${collection.sku}.html`,
  }];
}));

const candidates = verifiedVariants.filter((variant) => !variant.mappedVariantId);
const mapped = verifiedVariants.filter((variant) => variant.mappedVariantId);
const candidateCollections = collections.flatMap((collection) => {
  const rows = candidates.filter((variant) => variant.collectionSku === String(collection.sku));
  if (!rows.length) return [];
  return [{
    collectionSku: String(collection.sku),
    title: collection.title,
    candidateVariants: rows.length,
    totalVariants: collection.variants.length,
    minPrice: Math.min(...rows.map((row) => row.salePrice)),
    maxPrice: Math.max(...rows.map((row) => row.salePrice)),
    sourceUrl: `https://item.jd.com/${collection.sku}.html`,
  }];
});

const workbook = Workbook.create();
const summary = workbook.worksheets.add("准备概览");
const collectionsSheet = workbook.worksheets.add("商品合集");
const candidatesSheet = workbook.worksheets.add("待导入SKU");
const campaignSheet = workbook.worksheets.add("推广配置");
const mappedSheet = workbook.worksheets.add("已接入SKU");

const palette = {
  ink: "#202320",
  forest: "#365047",
  forestDark: "#263B34",
  paper: "#F3F1EC",
  white: "#FBFAF7",
  line: "#D7D6D0",
  paleGreen: "#E7ECE8",
  paleYellow: "#FFF4CC",
  paleRed: "#FBE5E5",
};

for (const sheet of [summary, collectionsSheet, candidatesSheet, campaignSheet, mappedSheet]) {
  sheet.showGridLines = false;
}

summary.getRange("A1:H2").merge();
summary.getRange("A1").values = [["ORIGI Shopify 购买与推广准备表"]];
summary.getRange("A1:H2").format = {
  fill: palette.forestDark,
  font: { color: "#FFFFFF", bold: true, size: 22 },
  verticalAlignment: "center",
};
summary.getRange("A3:H3").merge();
summary.getRange("A3").values = [["用于核对已核价商品、Shopify 草稿导入范围、库存阻塞与推广配置。数据截至 2026-07-17。"]];
summary.getRange("A3:H3").format = { fill: palette.paper, font: { color: "#6D706B", italic: true }, wrapText: true };

summary.getRange("A5:B5").merge();
summary.getRange("C5:D5").merge();
summary.getRange("E5:F5").merge();
summary.getRange("G5:H5").merge();
summary.getRange("A5").values = [["已核价 SKU"]];
summary.getRange("C5").values = [["已接入结算"]];
summary.getRange("E5").values = [["待导入草稿"]];
summary.getRange("G5").values = [["涉及商品合集"]];
summary.getRange("A6:B7").merge();
summary.getRange("C6:D7").merge();
summary.getRange("E6:F7").merge();
summary.getRange("G6:H7").merge();
summary.getRange("A6").formulas = [["=COUNTA('待导入SKU'!$D$5:$D$294)+COUNTA('已接入SKU'!$D$5:$D$8)"]];
summary.getRange("C6").formulas = [["=COUNTA('已接入SKU'!$D$5:$D$8)"]];
summary.getRange("E6").formulas = [["=COUNTA('待导入SKU'!$D$5:$D$294)"]];
summary.getRange("G6").formulas = [["=COUNTA('商品合集'!$A$5:$A$85)"]];
summary.getRange("A5:H5").format = { fill: palette.forest, font: { color: "#FFFFFF", bold: true }, horizontalAlignment: "center" };
summary.getRange("A6:H7").format = { fill: palette.white, font: { color: palette.forestDark, bold: true, size: 22 }, horizontalAlignment: "center", verticalAlignment: "center", borders: { preset: "outside", style: "thin", color: palette.line } };

summary.getRange("A9:H9").merge();
summary.getRange("A9").values = [["上线阻塞检查"]];
summary.getRange("A9:H9").format = { fill: palette.forestDark, font: { color: "#FFFFFF", bold: true } };
summary.getRange("A10:H14").values = [
  ["项目", "当前状态", "影响", "所需动作", null, null, null, null],
  ["Shopify 套餐", "Trial", "无法正式收款", "店主在 Shopify 后台选择正式套餐", null, null, null, null],
  ["店铺密码", "已开启", "结算链接会跳转密码页", "升级套餐后移除在线商店密码", null, null, null, null],
  ["支付服务商", "待配置", "顾客无法完成付款", "店主在设置 → 付款中启用可用服务商", null, null, null, null],
  ["库存", "290 个 SKU 待确认", "不能安全激活草稿", "确认真实库存后再批量激活", null, null, null, null],
];
summary.getRange("A10:H10").format = { fill: palette.paper, font: { bold: true, color: palette.ink } };
summary.getRange("A11:H14").format = { wrapText: true, borders: { preset: "inside", style: "thin", color: palette.line } };
summary.getRange("B11:B14").format = { fill: palette.paleYellow, font: { bold: true, color: "#8A5A00" } };
summary.getRange("A16:H16").merge();
summary.getRange("A16").values = [["建议顺序：① 选择套餐并启用支付  ② 确认库存  ③ 导入草稿  ④ 抽样测试订单  ⑤ 创建优惠码并投放推广链接"]];
summary.getRange("A16:H16").format = { fill: palette.paleGreen, font: { color: palette.forestDark, bold: true }, wrapText: true };
summary.getRange("A18:H20").merge();
summary.getRange("A18").values = [["数据来源：当前 ORIGI 商品目录与已连接 Shopify 店铺。公开站点：https://uncle-jacking.github.io/ ；交易后台：https://mqzvqg-1b.myshopify.com"]];
summary.getRange("A18:H20").format = { fill: palette.paper, font: { color: "#6D706B", size: 10 }, wrapText: true, verticalAlignment: "top" };
summary.getRange("A:H").format.columnWidth = 16;
summary.getRange("A1:H20").format.rowHeight = 24;
summary.getRange("A1:H2").format.rowHeight = 32;

const collectionHeaders = ["合集SKU", "商品标题", "待导入SKU数", "合集SKU总数", "最低售价", "最高售价", "准备状态", "来源"];
collectionsSheet.getRange("A1:H2").merge();
collectionsSheet.getRange("A1").values = [["待导入商品合集（全部作为草稿）"]];
collectionsSheet.getRange("A1:H2").format = { fill: palette.forestDark, font: { color: "#FFFFFF", bold: true, size: 20 }, verticalAlignment: "center" };
collectionsSheet.getRange("A3:H3").merge();
collectionsSheet.getRange("A3").values = [["每个京东商品合集保持为一个 Shopify 多规格商品；当前最大 5 个待导入规格，未超过 100 规格限制。"]];
collectionsSheet.getRange("A3:H3").format = { fill: palette.paper, font: { color: "#6D706B" }, wrapText: true };
collectionsSheet.getRange("A4:H4").values = [collectionHeaders];
collectionsSheet.getRange("A4:H4").format = { fill: palette.forest, font: { color: "#FFFFFF", bold: true }, wrapText: true };
const collectionRows = candidateCollections.map((row) => [row.collectionSku, row.title, row.candidateVariants, row.totalVariants, row.minPrice, row.maxPrice, "READY", row.sourceUrl]);
collectionsSheet.getRangeByIndexes(4, 0, collectionRows.length, collectionHeaders.length).values = collectionRows;
collectionsSheet.getRange(`A5:A${collectionRows.length + 4}`).format.numberFormat = "0";
collectionsSheet.getRange(`E5:F${collectionRows.length + 4}`).format.numberFormat = '¥#,##0.00';
collectionsSheet.getRange(`G5:G${collectionRows.length + 4}`).conditionalFormats.add("containsText", { text: "READY", format: { fill: palette.paleGreen, font: { color: palette.forestDark, bold: true } } });
collectionsSheet.tables.add(`A4:H${collectionRows.length + 4}`, true, "CollectionCandidates");
collectionsSheet.freezePanes.freezeRows(4);
collectionsSheet.getRange("A:A").format.columnWidth = 18;
collectionsSheet.getRange("B:B").format.columnWidth = 56;
collectionsSheet.getRange("C:G").format.columnWidth = 15;
collectionsSheet.getRange("H:H").format.columnWidth = 40;
collectionsSheet.getRange(`A5:H${collectionRows.length + 4}`).format.wrapText = true;

const candidateHeaders = ["合集SKU", "商品标题", "规格序号", "SKU ID", "精确规格名", "销售价", "划线价", "规格图片", "导入状态", "库存状态", "校验结果", "来源"];
candidatesSheet.getRange("A1:L2").merge();
candidatesSheet.getRange("A1").values = [["Shopify 待导入 SKU 明细"]];
candidatesSheet.getRange("A1:L2").format = { fill: palette.forestDark, font: { color: "#FFFFFF", bold: true, size: 20 }, verticalAlignment: "center" };
candidatesSheet.getRange("A3:L3").merge();
candidatesSheet.getRange("A3").values = [["所有行必须以 Draft 导入。库存未确认前不可激活，不使用估算库存。"]];
candidatesSheet.getRange("A3:L3").format = { fill: palette.paleYellow, font: { color: "#8A5A00", bold: true } };
candidatesSheet.getRange("A4:L4").values = [candidateHeaders];
candidatesSheet.getRange("A4:L4").format = { fill: palette.forest, font: { color: "#FFFFFF", bold: true }, wrapText: true };
const candidateRows = candidates.map((row) => [row.collectionSku, row.productTitle, row.variantOrder, row.skuId, row.variantName, row.salePrice, row.compareAtPrice, row.imageUrl, "Draft", "待店主确认", null, row.sourceUrl]);
candidatesSheet.getRangeByIndexes(4, 0, candidateRows.length, candidateHeaders.length).values = candidateRows;
candidatesSheet.getRange(`A5:A${candidateRows.length + 4}`).format.numberFormat = "0";
candidatesSheet.getRange(`D5:D${candidateRows.length + 4}`).format.numberFormat = "0";
candidatesSheet.getRange("K5").formulas = [["=IF(AND(D5<>\"\",F5>0,H5<>\"\",I5=\"Draft\"),\"READY\",\"BLOCKED\")"]];
candidatesSheet.getRange(`K5:K${candidateRows.length + 4}`).fillDown();
candidatesSheet.getRange(`F5:G${candidateRows.length + 4}`).format.numberFormat = '¥#,##0.00';
candidatesSheet.getRange(`J5:J${candidateRows.length + 4}`).format = { fill: palette.paleYellow, font: { color: "#8A5A00" } };
candidatesSheet.getRange(`K5:K${candidateRows.length + 4}`).conditionalFormats.add("containsText", { text: "READY", format: { fill: palette.paleGreen, font: { color: palette.forestDark, bold: true } } });
candidatesSheet.getRange(`K5:K${candidateRows.length + 4}`).conditionalFormats.add("containsText", { text: "BLOCKED", format: { fill: palette.paleRed, font: { color: "#8A1C1C", bold: true } } });
candidatesSheet.tables.add(`A4:L${candidateRows.length + 4}`, true, "SkuImportCandidates");
candidatesSheet.freezePanes.freezeRows(4);
for (const [column, width] of Object.entries({ A: 18, B: 52, C: 10, D: 18, E: 44, F: 14, G: 14, H: 46, I: 14, J: 18, K: 14, L: 40 })) candidatesSheet.getRange(`${column}:${column}`).format.columnWidth = width;
candidatesSheet.getRange(`A5:L${candidateRows.length + 4}`).format.wrapText = true;

campaignSheet.getRange("A1:F2").merge();
campaignSheet.getRange("A1").values = [["推广活动配置"]];
campaignSheet.getRange("A1:F2").format = { fill: palette.forestDark, font: { color: "#FFFFFF", bold: true, size: 20 }, verticalAlignment: "center" };
campaignSheet.getRange("A3:F3").merge();
campaignSheet.getRange("A3").values = [["黄色单元格由店主填写；确认后可在 Shopify 创建正式优惠码，并用带 ref 的链接追踪成交来源。"]];
campaignSheet.getRange("A3:F3").format = { fill: palette.paper, font: { color: "#6D706B" }, wrapText: true };
campaignSheet.getRange("A5:B10").values = [
  ["配置项", "店主输入"],
  ["优惠码", ""],
  ["优惠比例", null],
  ["最低订单金额", null],
  ["开始时间", null],
  ["结束时间", null],
];
campaignSheet.getRange("A5:B5").format = { fill: palette.forest, font: { color: "#FFFFFF", bold: true } };
campaignSheet.getRange("B6:B10").format = { fill: palette.paleYellow };
campaignSheet.getRange("B7").format.numberFormat = "0%";
campaignSheet.getRange("B8").format.numberFormat = '¥#,##0.00';
campaignSheet.getRange("B9:B10").format.numberFormat = "yyyy-mm-dd hh:mm";
campaignSheet.getRange("A12:F12").values = [["渠道名称", "ref 代码", "分享链接", "优惠码", "投放状态", "备注"]];
campaignSheet.getRange("A12:F12").format = { fill: palette.forest, font: { color: "#FFFFFF", bold: true } };
const channelRows = Array.from({ length: 8 }, (_, index) => [`渠道 ${index + 1}`, "", null, null, "待配置", ""]);
campaignSheet.getRange("A13:F20").values = channelRows;
campaignSheet.getRange("B13:B20").format = { fill: palette.paleYellow };
campaignSheet.getRange("F13:F20").format = { fill: palette.paleYellow };
campaignSheet.getRange("C13").formulas = [["=IF(B13=\"\",\"\",\"https://uncle-jacking.github.io/?ref=\"&B13)"]];
campaignSheet.getRange("C13:C20").fillDown();
campaignSheet.getRange("D13").formulas = [["=IF($B$6=\"\",\"\",$B$6)"]];
campaignSheet.getRange("D13:D20").fillDown();
campaignSheet.getRange("E13").formulas = [["=IF(B13=\"\",\"待配置\",\"链接已生成\")"]];
campaignSheet.getRange("E13:E20").fillDown();
campaignSheet.getRange("E13:E20").conditionalFormats.add("containsText", { text: "链接已生成", format: { fill: palette.paleGreen, font: { color: palette.forestDark, bold: true } } });
campaignSheet.tables.add("A12:F20", true, "CampaignChannels");
campaignSheet.getRange("A:A").format.columnWidth = 20;
campaignSheet.getRange("B:B").format.columnWidth = 22;
campaignSheet.getRange("C:C").format.columnWidth = 54;
campaignSheet.getRange("D:E").format.columnWidth = 18;
campaignSheet.getRange("F:F").format.columnWidth = 36;
campaignSheet.getRange("A22:F24").merge();
campaignSheet.getRange("A22").values = [["说明：网站已自动保存 ref、utm_campaign 或 utm_source，并把来源随 Shopify 结算链接带入订单。创建优惠码前仍需确认折扣比例、门槛和生效时间。"]];
campaignSheet.getRange("A22:F24").format = { fill: palette.paleGreen, font: { color: palette.forestDark }, wrapText: true, verticalAlignment: "top" };

const mappedHeaders = ["合集SKU", "商品标题", "规格序号", "SKU ID", "精确规格名", "销售价", "Shopify Variant ID", "状态"];
mappedSheet.getRange("A1:H2").merge();
mappedSheet.getRange("A1").values = [["已接入 Shopify Checkout 的 SKU"]];
mappedSheet.getRange("A1:H2").format = { fill: palette.forestDark, font: { color: "#FFFFFF", bold: true, size: 20 }, verticalAlignment: "center" };
mappedSheet.getRange("A3:H3").merge();
mappedSheet.getRange("A3").values = [["这些 SKU 已完成价格与 Shopify Variant ID 精确映射，网站可生成正式结算链接。"]];
mappedSheet.getRange("A3:H3").format = { fill: palette.paleGreen, font: { color: palette.forestDark } };
mappedSheet.getRange("A4:H4").values = [mappedHeaders];
mappedSheet.getRange("A4:H4").format = { fill: palette.forest, font: { color: "#FFFFFF", bold: true } };
const mappedRows = mapped.map((row) => [row.collectionSku, row.productTitle, row.variantOrder, row.skuId, row.variantName, row.salePrice, row.mappedVariantId, "ACTIVE"]);
mappedSheet.getRangeByIndexes(4, 0, mappedRows.length, mappedHeaders.length).values = mappedRows;
mappedSheet.getRange(`A5:A${mappedRows.length + 4}`).format.numberFormat = "0";
mappedSheet.getRange(`D5:D${mappedRows.length + 4}`).format.numberFormat = "0";
mappedSheet.getRange(`G5:G${mappedRows.length + 4}`).format.numberFormat = "0";
mappedSheet.getRange(`F5:F${mappedRows.length + 4}`).format.numberFormat = '¥#,##0.00';
mappedSheet.getRange(`H5:H${mappedRows.length + 4}`).format = { fill: palette.paleGreen, font: { color: palette.forestDark, bold: true } };
mappedSheet.tables.add(`A4:H${mappedRows.length + 4}`, true, "MappedSkuTable");
mappedSheet.freezePanes.freezeRows(4);
for (const [column, width] of Object.entries({ A: 18, B: 52, C: 10, D: 18, E: 44, F: 14, G: 24, H: 14 })) mappedSheet.getRange(`${column}:${column}`).format.columnWidth = width;
mappedSheet.getRange(`A5:H${mappedRows.length + 4}`).format.wrapText = true;

const summaryCheck = await workbook.inspect({
  kind: "table",
  range: "准备概览!A1:H20",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 8,
  maxChars: 5000,
});
const candidateCheck = await workbook.inspect({
  kind: "table",
  range: "待导入SKU!A4:L12",
  include: "values,formulas",
  tableMaxRows: 9,
  tableMaxCols: 12,
  maxChars: 5000,
});
const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});

await fs.mkdir(previewDir, { recursive: true });
for (const [sheetName, range] of [["准备概览", "A1:H20"], ["商品合集", "A1:H18"], ["待导入SKU", "A1:L18"], ["推广配置", "A1:F24"], ["已接入SKU", "A1:H8"]]) {
  const preview = await workbook.render({ sheetName, range, scale: 1.2, format: "png" });
  await fs.writeFile(path.join(previewDir, `${sheetName}.png`), new Uint8Array(await preview.arrayBuffer()));
}

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(JSON.stringify({
  outputPath,
  previewDir,
  verified: verifiedVariants.length,
  mapped: mapped.length,
  candidates: candidates.length,
  candidateCollections: candidateCollections.length,
  summaryCheck: summaryCheck.ndjson,
  candidateCheck: candidateCheck.ndjson,
  formulaErrors: formulaErrors.ndjson,
}));
