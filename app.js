const defaultMaterialLocations = {
  EAV65015705: "L1, L2, L3",
  EAH61953801: "D2, D3, D4, D5",
  EDTY0008601: "D1",
  "2IP4310AATC-RG": "U1, U2, U3",
  SN74HCS21PWR: "IC1",
  "0ISTLKE002A": "IC2",
  EBK61451301: "Q1, Q2, Q3",
  "0RH5101C622": "R4, R9, R14",
  "0RH1002C622": "R5, R10, R15",
  "0RJ2001D477": "R1, R6, R11",
  EBC64896001: "R2, R3, R7, R8, R12, R13",
  EAE36617601: "C1, C2",
};

const materials = [
  { code: "EAX69587604", name: "97.5 x 97.5 x 1.6t(mm), FR4", requiredQty: 1 },
  { code: "EAV65015705", name: "3.45x3.45x3.8t, 32.5mW@1500mA", requiredQty: 3 },
  { code: "EAH61953801", name: "12V / SD12C", requiredQty: 4 },
  { code: "EDTY0008601", name: "5V / SD05C", requiredQty: 1 },
  { code: "2IP4310AATC-RG", name: "IC AS431ANTR-G1, SOT23, DIODES", requiredQty: 3 },
  { code: "SN74HCS21PWR", name: "SN74HCS21PWR / Single 4-Input AND Gates", requiredQty: 1 },
  { code: "0ISTLKE002A", name: "KIA78L05F 7TO20V 5V 500MW SOT89 R/TP 3P", requiredQty: 1 },
  { code: "EBK61451301", name: "KTC4378 NPN SOT89 ST 3P KEC CORP.", requiredQty: 3 },
  { code: "0RH5101C622", name: "R5.1KΩ, J, 1/8W, 1608", requiredQty: 3 },
  { code: "0RH1002C622", name: "R10KΩ, J, 1/8W, 1608", requiredQty: 3 },
  { code: "0RJ2001D477", name: "R2KΩ, F, 1/8W, 1608", requiredQty: 3 },
  { code: "EBC64896001", name: "R40.2Ω, F, 1/8W, 3216", requiredQty: 6 },
  { code: "EAE36617601", name: "50V 100nF X7R 1608", requiredQty: 2 },
  { code: "EAG64892301", name: "12507WR-03 3P 1.25MM 1R ANGLE SMD REEL", requiredQty: 1 },
  { code: "KOG2025A1", name: "7.5 x 7.5 x 14t(mm)", requiredQty: 1 },
  { code: "KOP2023B4", name: "43.2 x 11.1 x 7.2 x 2t(mm), ABS", requiredQty: 1 },
  { code: "KOT2020A1", name: "PACKING TRAY, PET, 330*330*17.9*0.8㎜(W*L*H*T), ANTI STATIC, CLEAR", requiredQty: 0.111111111 },
  { code: "5PKC00583A", name: "CARTON BOX ** CORRUGATED PAPER, 356*356*282*5㎜ (W*L*H*T, 내측), KLB175/K180/KLB175", requiredQty: 0.00037 },
  { code: "KOP2020A5", name: "PACKING PAD ** PAPER, 335*335*5㎜ (W*L*T), PROTECTION, KLB175/K180 /KLB175, RoHS,", requiredQty: 0.00073 },
].map((item) => ({
  ...item,
  itemName: "에어로타워",
  location: defaultMaterialLocations[item.code] || "",
  supplier: "",
  stock: 0,
  leadTime: 0,
  safetyStock: 0,
  unitPrice: 0,
  inboundQty: 0,
  inboundDate: null,
}));

const today = new Date("2026-07-06T09:00:00+09:00");

const formatNumber = new Intl.NumberFormat("ko-KR");
const formatQuantity = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 9,
});
const formatCurrency = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});
const materialStorageKey = "materialOps.materials";
const purchaseOrderStorageKey = "materialOps.purchaseOrders";
const storageKeyPrefix = "materialOps.";
const materialDatasetVersionKey = "materialOps.materialDatasetVersion";
const materialDatasetVersion = "20260715-aerotower-location-v3";
const numericMaterialFields = new Set(["stock", "safetyStock", "leadTime", "unitPrice"]);

function readMaterials() {
  try {
    if (!localStorage.getItem(materialStorageKey)) return null;
    const savedMaterials = JSON.parse(localStorage.getItem(materialStorageKey));
    return Array.isArray(savedMaterials) ? savedMaterials : null;
  } catch {
    return null;
  }
}

function writeMaterials(items) {
  localStorage.setItem(materialStorageKey, JSON.stringify(items));
}

function readPurchaseOrders() {
  try {
    return JSON.parse(localStorage.getItem(purchaseOrderStorageKey) || "[]");
  } catch {
    return [];
  }
}

function writePurchaseOrders(orders) {
  localStorage.setItem(purchaseOrderStorageKey, JSON.stringify(orders));
}

function clearAppStorage() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(storageKeyPrefix))
    .forEach((key) => {
      localStorage.removeItem(key);
    });
}

const savedMaterialDatasetVersion = localStorage.getItem(materialDatasetVersionKey);
const savedMaterials = readMaterials();
if (savedMaterialDatasetVersion !== materialDatasetVersion) {
  clearAppStorage();
  writeMaterials(materials);
  writePurchaseOrders([]);
  localStorage.setItem(materialDatasetVersionKey, materialDatasetVersion);
} else if (Array.isArray(savedMaterials)) {
  materials.splice(0, materials.length, ...savedMaterials);
}

function normalizeMaterialFields(item) {
  item.code = typeof item.code === "string" ? item.code : "";
  item.name = typeof item.name === "string" ? item.name : "";
  item.itemName = typeof item.itemName === "string" ? item.itemName : "";
  item.location = typeof item.location === "string" ? item.location : "";
  item.supplier = typeof item.supplier === "string" ? item.supplier : "";
  item.stock = Math.max(0, Number(item.stock) || 0);
  item.leadTime = Math.max(0, Number(item.leadTime) || 0);
  item.unitPrice = Math.max(0, Number(item.unitPrice) || 0);
  item.inboundQty = Math.max(0, Number(item.inboundQty) || 0);
  item.inboundDate = typeof item.inboundDate === "string" && item.inboundDate ? item.inboundDate : null;
  item.isMasterOnly = item.isMasterOnly === true;
  item.isDraft = item.isDraft === true;
  item.draftId = typeof item.draftId === "string" ? item.draftId : "";
  item.requiredQty = Number.isFinite(Number(item.requiredQty)) ? Math.max(0, Number(item.requiredQty)) : 1;
  if (Number.isFinite(Number(item.safetyStock))) {
    item.safetyStock = Math.max(0, Number(item.safetyStock));
  } else {
    const legacyDailyUsage = Math.max(0, Number(item.dailyUsage) || 0);
    const legacySafetyDays = Math.max(0, Number(item.safetyDays) || 0);
    const leadTime = Math.max(0, Number(item.leadTime) || 0);
    item.safetyStock = Math.ceil(legacyDailyUsage * (leadTime + legacySafetyDays));
  }
  delete item.dailyUsage;
  delete item.safetyDays;
  delete item.moq;
  delete item.replacementLevel;

  const isLegacyDraft = item.isMasterOnly
    && /^NEW-\d+$/.test(item.code)
    && item.name === "신규 자재"
    && !item.location
    && !item.supplier
    && Number(item.stock) === 0
    && Number(item.safetyStock) === 0
    && Number(item.leadTime) === 0
    && Number(item.unitPrice) === 0;
  if (isLegacyDraft) {
    item.isDraft = true;
    item.draftId ||= `legacy-${item.code}`;
    item.code = "";
    item.name = "";
  }
  return item;
}

materials.forEach(normalizeMaterialFields);
writeMaterials(materials);

function emptyRow(colspan, message = "검색 결과가 없습니다.") {
  return `<tr><td class="empty-cell" colspan="${colspan}">${message}</td></tr>`;
}

function renderScrollRegion(container, markup, isEmpty = false) {
  container.classList.toggle("is-empty", isEmpty);
  container.innerHTML = markup;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date) {
  return date.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
}

function getPurchaseOrderPrefix(date = new Date()) {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

function getNextPurchaseOrderNo(date = new Date()) {
  const prefix = getPurchaseOrderPrefix(date);
  const maxSequence = purchaseOrders.reduce((max, order) => {
    if (!order.orderNo?.startsWith(`${prefix}-`)) return max;
    const sequence = Number(order.orderNo.replace(`${prefix}-`, ""));
    return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
  }, 0);
  return `${prefix}-${maxSequence + 1}`;
}

function getStockStatus(stock, safetyStock) {
  if (stock < safetyStock) return "critical";
  if (safetyStock > 0 && stock < safetyStock * 1.5) return "watch";
  return "ok";
}

function getOpenInboundQty(item) {
  return purchaseOrders.reduce((total, order) => {
    const orderQty = (Array.isArray(order.rows) ? order.rows : [])
      .filter((row) => row.code === item.code || (!row.code && row.name === item.name))
      .reduce((sum, row) => sum + (Number(row.qty) || 0), 0);
    return total + orderQty;
  }, 0);
}

function getPlanBase(item) {
  const stock = Math.max(0, Number(item.stock) || 0);
  const safetyStock = Math.max(0, Number(item.safetyStock) || 0);
  const spareQty = stock - safetyStock;
  const shortageQty = Math.max(0, -spareQty);
  const recordedInboundQty = Math.max(0, Number(item.inboundQty) || 0);
  const orderedInboundQty = getOpenInboundQty(item);
  const inboundQty = recordedInboundQty + orderedInboundQty;
  const inboundSpareQty = stock + inboundQty - safetyStock;
  const recommendedQty = Math.max(0, -inboundSpareQty);
  const amount = recommendedQty * item.unitPrice;
  const expectedReceiptDate = recommendedQty > 0 ? addDays(today, item.leadTime) : null;
  const inboundDate = item.inboundDate ? new Date(`${item.inboundDate}T09:00:00+09:00`) : null;
  const shortageRatio = safetyStock > 0 ? Math.min(1, shortageQty / safetyStock) : 0;
  const shortageScore = shortageRatio * 45;
  const status = getStockStatus(stock, safetyStock);

  return {
    ...item,
    stock,
    safetyStock,
    spareQty,
    shortageQty,
    recommendedQty,
    expectedReceiptDate,
    inboundDate,
    recordedInboundQty,
    orderedInboundQty,
    inboundQty,
    inboundSpareQty,
    deliveryRisk: recommendedQty > 0,
    shortageScore,
    status,
    amount,
  };
}

function buildPlans() {
  const materialMasters = new Map();
  materials.forEach((item) => {
    if (item.isDraft) return;
    const key = item.code.trim() || item.name.trim();
    if (!key) return;
    if (!materialMasters.has(key)) {
      materialMasters.set(key, { ...item, itemNames: [] });
    }
    const master = materialMasters.get(key);
    if (item.itemName && !master.itemNames.includes(item.itemName)) {
      master.itemNames.push(item.itemName);
    }
  });
  const basePlans = [...materialMasters.values()].map(getPlanBase);
  const maxAmount = Math.max(...basePlans.map((row) => row.amount), 0);
  const maxLeadTime = Math.max(...basePlans.map((row) => row.leadTime), 1);
  return basePlans.map((row) => {
    const amountImpactScore = maxAmount > 0 ? (row.amount / maxAmount) * 20 : 0;
    const procurementRiskScore = row.shortageQty > 0 ? (row.leadTime / maxLeadTime) * 35 : 0;
    return {
      ...row,
      amountImpactScore,
      procurementRiskScore,
      priorityScore: Math.round(row.shortageScore + procurementRiskScore + amountImpactScore),
    };
  });
}
let purchaseOrders = readPurchaseOrders();
let plans = buildPlans();
let activeInboundSort = "priority";
let activeInventorySort = "short";
let activeLeadSort = "long";
const productionTargets = {};
const defaultTableSortState = {
  dashboardPlan: null,
  materials: null,
};
const tableSortState = structuredClone(defaultTableSortState);
let activeViewName = null;

function resetTableSortForView(viewName) {
  const tableByView = {
    dashboard: "dashboardPlan",
    materials: "materials",
  };
  const tableName = tableByView[viewName];
  if (!tableName) return;
  tableSortState[tableName] = defaultTableSortState[tableName]
    ? { ...defaultTableSortState[tableName] }
    : null;
}

const pageMeta = {
  dashboard: ["Material Planning Console", "구매·자재 운영 현황"],
  spec: ["Material Specification", "자재명세"],
  materials: ["Material Management", "자재관리"],
  production: ["Production Management", "생산관리"],
  planning: ["Purchase Management", "발주관리"],
  settings: ["Material Information", "자재정보"],
  dataSettings: ["Data Settings", "설정"],
};

function statusLabel(status) {
  if (status === "critical") return "긴급";
  if (status === "watch") return "주의";
  return "정상";
}

function statusRank(status) {
  if (status === "critical") return 0;
  if (status === "watch") return 1;
  return 2;
}

function sortValue(row, key) {
  if (key === "status") return statusRank(row.status);
  const value = row[key];
  if (value instanceof Date) return value.getTime();
  if (value === null || value === undefined || value === "") return Number.MAX_SAFE_INTEGER;
  return value;
}

function compareRowsByKey(key, direction) {
  return (a, b) => {
    const left = sortValue(a, key);
    const right = sortValue(b, key);
    const order = direction === "desc" ? -1 : 1;

    if (typeof left === "string" || typeof right === "string") {
      return String(left).localeCompare(String(right), "ko") * order;
    }
    return (left - right) * order;
  };
}

function sortTableRows(tableName, rows, defaultSorter) {
  const sortState = tableSortState[tableName];
  const nextRows = [...rows];
  if (!sortState) return nextRows.sort(defaultSorter);
  return nextRows.sort(compareRowsByKey(sortState.key, sortState.direction));
}

function updateSortHeaders() {
  document.querySelectorAll("[data-sort-table]").forEach((button) => {
    const sortState = tableSortState[button.dataset.sortTable];
    const isActive = sortState?.key === button.dataset.sortKey;
    const indicator = button.querySelector("span");
    const directionLabel = sortState?.direction === "desc" ? "내림차순" : "오름차순";
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.title = isActive ? `현재 ${directionLabel} 정렬` : "정렬";
    if (indicator) {
      indicator.textContent = isActive
        ? sortState.direction === "desc" ? "↓" : "↑"
        : "⇅";
    }
    button.closest("th")?.setAttribute("aria-sort", isActive ? (sortState.direction === "desc" ? "descending" : "ascending") : "none");
  });
}

function getFilteredMaterialMasters() {
  const keyword = document.querySelector("#searchInput").value.trim().toLowerCase();

  return plans.filter((row) => {
    const keywordMatched = [row.itemNames?.join(" "), row.name, row.code, row.location, row.supplier]
      .some((value) => String(value || "").toLowerCase().includes(keyword));
    return keywordMatched;
  });
}

function getFilteredBomEntries() {
  const keyword = document.querySelector("#searchInput").value.trim().toLowerCase();

  return materials
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.isMasterOnly)
    .filter(({ item }) => [item.itemName, item.name, item.code, item.location, item.supplier]
      .some((value) => String(value || "").toLowerCase().includes(keyword)));
}

function renderSummary(rows) {
  const critical = rows.filter((row) => row.status === "critical").length;
  const watch = rows.filter((row) => row.status === "watch").length;
  const normal = rows.filter((row) => row.status === "ok").length;
  const amount = rows.reduce((sum, row) => sum + row.amount, 0);

  document.querySelector("#criticalCount").textContent = `${critical}개`;
  document.querySelector("#plannedCount").textContent = `${normal}개`;
  document.querySelector("#deliveryRiskCount").textContent = `${watch}개`;
  document.querySelector("#orderAmount").textContent = formatCurrency.format(amount);
}

function parseMonthDayDate(value) {
  const match = String(value || "").match(/(\d{1,2})\.\s*(\d{1,2})\./);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  if (!Number.isFinite(month) || !Number.isFinite(day)) return null;
  return new Date(today.getFullYear(), month - 1, day, 9, 0, 0);
}

function findPlanForOrderItem(item) {
  return plans.find((row) => row.code === item.code)
    || plans.find((row) => row.name === item.name)
    || null;
}

function getPurchaseOrderInboundRows() {
  const keyword = document.querySelector("#searchInput").value.trim().toLowerCase();

  return purchaseOrders.flatMap((order) => {
    return (Array.isArray(order.rows) ? order.rows : []).map((item) => {
      const material = findMaterialForOrderItem(item);
      const plan = findPlanForOrderItem(item);
      const deliveryText = formatOrderDeliveryDate(order, item);
      const inboundDate = parseMonthDayDate(deliveryText);
      const stock = Number(material?.stock) || 0;
      const safetyStock = Number(material?.safetyStock) || 0;
      const inboundQty = Number(item.qty) || 0;
      const inboundSpareQty = stock + inboundQty - safetyStock;

      return {
        order,
        item,
        material,
        name: item.name || material?.name || "-",
        code: item.code || material?.code || "-",
        supplier: material?.supplier || "",
        inboundQty,
        inboundDate,
        inboundDateText: inboundDate ? formatDate(inboundDate) : deliveryText,
        inboundSpareQty,
        deliveryRisk: inboundSpareQty < 0,
        priorityScore: plan?.priorityScore || 0,
      };
    });
  }).filter((row) => {
    if (!keyword) return true;
    return [row.name, row.code, row.supplier, row.order.orderNo]
      .some((value) => String(value || "").toLowerCase().includes(keyword));
  });
}

function renderPriority() {
  const list = document.querySelector("#priorityList");
  const inboundRows = getPurchaseOrderInboundRows();

  inboundRows.sort((a, b) => {
    if (activeInboundSort === "inbound") {
      const left = a.inboundDate ? a.inboundDate.getTime() : Number.MAX_SAFE_INTEGER;
      const right = b.inboundDate ? b.inboundDate.getTime() : Number.MAX_SAFE_INTEGER;
      return left - right;
    }
    if (activeInboundSort === "coverage") return a.inboundSpareQty - b.inboundSpareQty;
    return b.priorityScore - a.priorityScore;
  });

  if (inboundRows.length === 0) {
    renderScrollRegion(list, `<div class="empty-state">확인할 입고 예정 품목이 없습니다.</div>`, true);
    return;
  }

  renderScrollRegion(list, inboundRows.map((row) => {
    const coverageLabel = row.inboundSpareQty < 0
      ? `입고 후 부족 ${formatNumber.format(Math.abs(row.inboundSpareQty))}개`
      : `입고 후 여유 ${formatNumber.format(row.inboundSpareQty)}개`;
    return `
      <article class="timeline-item ${row.deliveryRisk ? "risk" : ""}">
        <header>
          <strong>${escapeHtml(row.name)}</strong>
          <span class="state ${row.deliveryRisk ? "critical" : "ok"}">${row.deliveryRisk ? "보충 부족" : "안전재고 충족"}</span>
        </header>
        <span>입고일 ${row.inboundDateText} · ${formatNumber.format(row.inboundQty)}개</span>
        <span>${coverageLabel}</span>
      </article>
    `;
  }).join(""));
}

function renderDashboardPlanTable(rows) {
  const table = document.querySelector("#dashboardPlanTable");
  if (rows.length === 0) {
    table.innerHTML = emptyRow(7);
    return;
  }

  table.innerHTML = sortTableRows("dashboardPlan", rows, (a, b) => b.priorityScore - a.priorityScore)
    .map((row) => `
      <tr>
        <td>${escapeHtml(row.code)}</td>
        <td><span class="material-name"><strong>${escapeHtml(row.name)}</strong></span></td>
        <td>${formatNumber.format(row.stock)}</td>
        <td>${formatNumber.format(row.safetyStock)}</td>
        <td class="${row.spareQty < 0 ? "shortage-value" : ""}">${row.spareQty < 0 ? "부족 " + formatNumber.format(Math.abs(row.spareQty)) : "여유 " + formatNumber.format(row.spareQty)}</td>
        <td>${row.leadTime}일</td>
        <td><span class="state ${row.status}">${statusLabel(row.status)}</span></td>
      </tr>
    `).join("");
}

function renderMaterialsTable(rows) {
  const table = document.querySelector("#materialsTable");
  if (rows.length === 0) {
    table.innerHTML = emptyRow(6);
    return;
  }

  table.innerHTML = sortTableRows("materials", rows, (a, b) => a.code.localeCompare(b.code, "ko"))
    .map((row) => `
      <tr>
        <td>${escapeHtml(row.code)}</td>
        <td><span class="material-name"><strong>${escapeHtml(row.name)}</strong></span></td>
        <td>${formatNumber.format(row.stock)}</td>
        <td>${formatNumber.format(row.safetyStock)}</td>
        <td class="${row.spareQty < 0 ? "shortage-value" : ""}">${row.spareQty < 0 ? "-" : "+"}${formatNumber.format(Math.abs(row.spareQty))}</td>
        <td><span class="state ${row.status}">${statusLabel(row.status)}</span></td>
      </tr>
    `).join("");
}

function renderMaterialInfoTable(rows) {
  const table = document.querySelector("#materialInfoTable");
  const draftRows = materials.filter((item) => item.isDraft);
  const tableRows = [...draftRows, ...rows];
  if (tableRows.length === 0) {
    table.innerHTML = emptyRow(9, "등록된 자재가 없습니다.");
    return;
  }

  table.innerHTML = tableRows
    .sort((a, b) => Number(b.isDraft) - Number(a.isDraft) || a.code.localeCompare(b.code, "ko"))
    .map((row) => {
      const identityAttribute = row.isDraft
        ? `data-master-id="${escapeHtml(row.draftId)}"`
        : `data-master-code="${escapeHtml(row.code)}"`;
      const label = row.code || "신규 자재";
      const numberValue = (value) => row.isDraft && Number(value) === 0 ? "" : value;
      const deleteAttribute = row.isDraft
        ? `data-delete-master-id="${escapeHtml(row.draftId)}"`
        : `data-delete-master-code="${escapeHtml(row.code)}"`;
      return `
      <tr>
        <td><input value="${escapeHtml(row.code)}" ${identityAttribute} data-master-field="code" aria-label="${escapeHtml(label)} 자재코드" /></td>
        <td><input value="${escapeHtml(row.name)}" ${identityAttribute} data-master-field="name" aria-label="${escapeHtml(label)} 자재명" /></td>
        <td><input value="${escapeHtml(row.location)}" ${identityAttribute} data-master-field="location" aria-label="${escapeHtml(label)} 위치" /></td>
        <td><input value="${escapeHtml(row.supplier)}" ${identityAttribute} data-master-field="supplier" aria-label="${escapeHtml(label)} 공급사" /></td>
        <td><input type="number" min="0" value="${numberValue(row.stock)}" ${identityAttribute} data-master-field="stock" aria-label="${escapeHtml(label)} 현재고" /></td>
        <td><input type="number" min="0" value="${numberValue(row.safetyStock)}" ${identityAttribute} data-master-field="safetyStock" aria-label="${escapeHtml(label)} 안전재고" /></td>
        <td><input type="number" min="0" value="${numberValue(row.leadTime)}" ${identityAttribute} data-master-field="leadTime" aria-label="${escapeHtml(label)} 리드타임" /></td>
        <td><input type="number" min="0" step="any" value="${numberValue(row.unitPrice)}" ${identityAttribute} data-master-field="unitPrice" aria-label="${escapeHtml(label)} 단가" /></td>
        <td><button class="danger-mini" type="button" ${deleteAttribute} aria-label="${escapeHtml(label)} 삭제">×</button></td>
      </tr>
    `;
    }).join("");
}

function renderSpecTable() {
  const table = document.querySelector("#specTable");
  const rows = getFilteredBomEntries();
  if (rows.length === 0) {
    table.innerHTML = emptyRow(5, "등록된 자재명세가 없습니다.");
    return;
  }

  table.innerHTML = rows.sort((a, b) => a.item.code.localeCompare(b.item.code, "ko"))
    .map(({ item }) => `
      <tr>
        <td>${escapeHtml(item.itemName)}</td>
        <td>${escapeHtml(item.code)}</td>
        <td><span class="material-name"><strong>${escapeHtml(item.name)}</strong></span></td>
        <td>${escapeHtml(item.location)}</td>
        <td>${formatQuantity.format(item.requiredQty)}</td>
      </tr>
    `).join("");
}

function renderInventoryChart(rows) {
  const chart = document.querySelector("#materialInventoryBarChart");
  const emptyMarkup = `<div class="empty-state">표시할 재고가 없습니다.</div>`;

  if (rows.length === 0) {
    renderScrollRegion(chart, emptyMarkup, true);
    return;
  }

  const maxGap = Math.max(...rows.map((row) => Math.abs(row.spareQty)), 1);
  const chartMarkup = [...rows]
    .sort((a, b) => activeInventorySort === "long" ? b.spareQty - a.spareQty : a.spareQty - b.spareQty)
    .map((row) => {
      const ratio = Math.max(5, Math.round((Math.abs(row.spareQty) / maxGap) * 100));
      const fillClass = row.spareQty < 0 ? "low" : row.status === "watch" ? "mid" : "";
      const valueLabel = row.spareQty < 0
        ? `부족 ${formatNumber.format(Math.abs(row.spareQty))}`
        : `여유 ${formatNumber.format(row.spareQty)}`;
      return `
        <div class="bar-row" title="${escapeHtml(row.name)}">
          <span>${escapeHtml(row.code)}</span>
          <div class="bar-track"><div class="bar-fill ${fillClass}" style="width: ${ratio}%"></div></div>
          <strong>${valueLabel}</strong>
        </div>
      `;
    }).join("");

  renderScrollRegion(chart, chartMarkup);
}

function renderBarChart(rows) {
  const chart = document.querySelector("#barChart");
  if (rows.length === 0) {
    renderScrollRegion(chart, `<div class="empty-state">표시할 자재가 없습니다.</div>`, true);
    return;
  }

  const maxLeadTime = Math.max(...rows.map((row) => row.leadTime), 1);
  const leadTimeRows = [...rows]
    .sort((a, b) => activeLeadSort === "short"
      ? a.leadTime - b.leadTime
      : b.leadTime - a.leadTime);
  const leadTimeRank = new Map(
    [...rows]
      .sort((a, b) => b.leadTime - a.leadTime)
      .map((row, index) => [row.code, (index / rows.length) * 100])
  );
  renderScrollRegion(chart, leadTimeRows
    .map((row) => {
      const rankPercent = leadTimeRank.get(row.code);
      const ratio = Math.max(5, Math.round((row.leadTime / maxLeadTime) * 100));
      const fillClass = rankPercent < 10 ? "low" : rankPercent < 40 ? "mid" : "";
      return `
        <div class="bar-row" title="${escapeHtml(row.name)}">
          <span>${escapeHtml(row.code)}</span>
          <div class="bar-track">
            <div class="bar-fill ${fillClass}" style="width: ${ratio}%"></div>
          </div>
          <strong>${row.leadTime}일</strong>
        </div>
      `;
    })
    .join(""));
}

function getProductionItems() {
  return [...new Set(materials
    .map((item) => item.itemName.trim())
    .filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ko"));
}

function getMaxProductionQty(itemName) {
  const bom = materials.filter((item) => item.itemName.trim() === itemName && item.requiredQty > 0);
  if (bom.length === 0) return 0;
  return Math.min(...bom.map((item) => {
    const usableStock = Math.max(0, item.stock - item.safetyStock);
    return Math.floor(usableStock / item.requiredQty);
  }));
}

function getProductionRequirements() {
  const requirements = new Map();

  getProductionItems().forEach((itemName) => {
    const productionQty = Math.max(0, Number(productionTargets[itemName]) || 0);
    if (productionQty === 0) return;

    materials
      .filter((material) => material.itemName.trim() === itemName && material.requiredQty > 0)
      .forEach((material) => {
        const key = material.code || material.name;
        const current = requirements.get(key) || {
          code: material.code,
          name: material.name,
          stock: material.stock,
          safetyStock: material.safetyStock,
          usableStock: Math.max(0, material.stock - material.safetyStock),
          required: 0,
          items: [],
        };
        current.required += material.requiredQty * productionQty;
        current.items.push({ itemName, requiredQty: material.requiredQty, productionQty });
        requirements.set(key, current);
      });
  });

  return [...requirements.values()]
    .map((row) => ({
      ...row,
      balance: row.usableStock - row.required,
      shortage: Math.max(0, row.required - row.usableStock),
    }))
    .sort((a, b) => b.shortage - a.shortage || a.code.localeCompare(b.code, "ko"));
}

function renderProductionProductList() {
  const container = document.querySelector("#productionProductList");
  const itemNames = getProductionItems();

  if (itemNames.length === 0) {
    container.innerHTML = `<div class="empty-state">자재명세에서 품목을 입력하면 제품이 자동으로 추가됩니다.</div>`;
    return;
  }

  container.innerHTML = itemNames.map((itemName) => `
    <label class="production-product-card">
      <span>
        <strong>${escapeHtml(itemName)}</strong>
        <small>안전재고 제외 최대 ${formatNumber.format(getMaxProductionQty(itemName))}개 생산 가능</small>
      </span>
      <span class="production-quantity">
        <input type="number" min="0" step="1" value="${productionTargets[itemName] || 0}" data-production-item="${escapeHtml(itemName)}" />
        <em>개</em>
      </span>
    </label>
  `).join("");
}

function renderProductionAnalysis() {
  const rows = getProductionRequirements();
  const table = document.querySelector("#productionMaterialsTable");
  if (rows.length === 0) {
    table.innerHTML = emptyRow(9, "제품별 생산수량을 입력하면 필요한 자재가 표시됩니다.");
    return;
  }

  table.innerHTML = rows.map((row) => {
    const itemNames = row.items.map((item) => item.itemName).join(", ");
    const unitRequirements = row.items
      .map((item) => `${item.itemName} ${formatQuantity.format(item.requiredQty)}`)
      .join(" · ");
    const productionQuantities = row.items
      .map((item) => `${item.itemName} ${formatNumber.format(item.productionQty)}`)
      .join(" · ");
    return `
      <tr>
        <td>${escapeHtml(itemNames)}</td>
        <td>${escapeHtml(row.code)}</td>
        <td class="production-material-name">${escapeHtml(row.name)}</td>
        <td>${escapeHtml(unitRequirements)}</td>
        <td>${escapeHtml(productionQuantities)}</td>
        <td>${formatQuantity.format(row.required)}</td>
        <td>${formatQuantity.format(row.usableStock)}</td>
        <td class="${row.balance < 0 ? "shortage-value" : row.balance > 0 ? "surplus-value" : ""}">${formatQuantity.format(row.balance)}</td>
        <td><span class="state ${row.shortage > 0 ? "critical" : "ok"}">${row.shortage > 0 ? "부족" : "충족"}</span></td>
      </tr>
    `;
  }).join("");
}

function renderProductionManagement() {
  renderProductionProductList();
  renderProductionAnalysis();
}

function render() {
  plans = buildPlans();
  const rows = getFilteredMaterialMasters();

  renderSummary(rows);
  renderPriority();
  renderDashboardPlanTable(rows);
  renderSpecTable();
  renderOrderHistory();
  renderMaterialInfoTable(rows);
  renderMaterialsTable(rows);
  renderInventoryChart(rows);
  renderBarChart(rows);
  renderProductionManagement();
  updateSortHeaders();
}

function createPurchaseOrderRecord(order) {
  const supplyAmount = order.rows.reduce((sum, row) => sum + row.supplyAmount, 0);
  const vat = order.rows.reduce((sum, row) => sum + row.vat, 0);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    orderNo: order.orderNo,
    createdAt: new Date().toISOString(),
    recipient: order.recipient,
    dueDate: order.dueDate,
    reference: order.reference,
    tel: order.tel,
    fax: order.fax,
    businessNo: order.businessNo,
    company: order.company,
    address: order.address,
    manager: order.manager,
    itemCount: order.rows.length,
    supplyAmount,
    vat,
    totalAmount: supplyAmount + vat,
    status: "작성완료",
    rows: order.rows,
  };
}

function savePurchaseOrder(order) {
  const nextOrders = [
    createPurchaseOrderRecord(order),
    ...purchaseOrders,
  ];
  purchaseOrders = nextOrders;
  writePurchaseOrders(purchaseOrders);
}

function buildJsonBackup() {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    materials,
    purchaseOrders,
  };
}

function downloadJsonSettings() {
  const blob = new Blob([JSON.stringify(buildJsonBackup(), null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `구매자재관리_설정_${getPurchaseOrderPrefix(new Date()).replaceAll(".", "-")}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  showToast("JSON 파일을 다운로드했습니다.");
}

function applyJsonSettings(data) {
  const nextMaterials = Array.isArray(data?.materials) ? data.materials : null;
  const nextOrders = Array.isArray(data?.purchaseOrders) ? data.purchaseOrders : null;

  if (!nextMaterials || !nextOrders) {
    showToast("올바른 JSON 설정 파일이 아닙니다.");
    return;
  }

  materials.splice(0, materials.length, ...nextMaterials.map(normalizeMaterialFields));
  purchaseOrders = nextOrders;
  writeMaterials(materials);
  writePurchaseOrders(purchaseOrders);
  plans = buildPlans();
  render();
  showToast("JSON 설정을 불러왔습니다.");
}

function uploadJsonSettings(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      applyJsonSettings(JSON.parse(reader.result));
    } catch {
      showToast("JSON 파일을 읽을 수 없습니다.");
    }
  });
  reader.readAsText(file);
}

function resetJsonSettings() {
  const confirmed = window.confirm("모든 정보를 삭제하고 초기화할까요?");
  if (!confirmed) return;

  materials.splice(0, materials.length);
  purchaseOrders = [];
  clearAppStorage();
  writeMaterials([]);
  writePurchaseOrders([]);
  localStorage.setItem(materialDatasetVersionKey, materialDatasetVersion);
  plans = buildPlans();
  render();
  showToast("모든 정보를 초기화했습니다.");
}

function renderOrderHistory() {
  const table = document.querySelector("#orderHistoryTable");
  if (!table) return;

  if (purchaseOrders.length === 0) {
    table.innerHTML = emptyRow(9, "작성된 발주가 없습니다.");
    return;
  }

  const orderItems = purchaseOrders.flatMap((order) => {
    return (Array.isArray(order.rows) ? order.rows : []).map((item) => ({
      order,
      item,
      material: findMaterialForOrderItem(item),
    }));
  });

  if (orderItems.length === 0) {
    table.innerHTML = emptyRow(9, "작성된 발주 품목이 없습니다.");
    return;
  }

  table.innerHTML = orderItems
    .map(({ order, item, material }) => `
        <tr>
          <td>${order.orderNo || "-"}</td>
          <td>${item.code || "-"}</td>
          <td>
            <span class="material-name">
              <strong>${item.name || "-"}</strong>
            </span>
          </td>
          <td>${material?.supplier || ""}</td>
          <td>${formatNumber.format(item.qty || 0)}</td>
          <td>${formatNumber.format(item.unitPrice || 0)}</td>
          <td>${formatNumber.format(item.supplyAmount || 0)}</td>
          <td>${formatOrderDeliveryDate(order, item)}</td>
          <td>
            <button class="mini-button" type="button" data-order-view-id="${order.id}">
              보기
            </button>
          </td>
        </tr>
      `)
    .join("");
}

function findMaterialForOrderItem(item) {
  return materials.find((material) => material.code === item.code)
    || materials.find((material) => material.name === item.name)
    || null;
}

function formatOrderDeliveryDate(order, item) {
  if (order.dueDate && order.dueDate !== "ASAP") return order.dueDate;
  const noteDate = item.note?.match(/\d{2}\.\s*\d{2}\./)?.[0];
  return noteDate || order.dueDate || "-";
}

function getStoredOrderForExcel(order) {
  return {
    orderNo: order.orderNo || "",
    recipient: order.recipient || "",
    reference: order.reference || "",
    tel: order.tel || "",
    fax: order.fax || "",
    dueDate: order.dueDate || "ASAP",
    businessNo: order.businessNo || "383-88-01197",
    company: order.company || "코넥스온텍 / 이오영",
    address: order.address || "경기도 시흥시 정왕천로 155 a동 201호(정왕동)",
    manager: order.manager || "오정석 / 010-8455-6775",
    rows: Array.isArray(order.rows) ? order.rows : [],
  };
}

function renderOrderViewer(order) {
  const excelOrder = getStoredOrderForExcel(order);
  const supplyAmount = excelOrder.rows.reduce((sum, row) => sum + row.supplyAmount, 0);
  const vat = excelOrder.rows.reduce((sum, row) => sum + row.vat, 0);
  const blankRows = Math.max(0, 12 - excelOrder.rows.length);

  document.querySelector("#orderViewerTitle").textContent = `발주서 보기 · ${excelOrder.orderNo || "-"}`;
  document.querySelector("#orderViewerBody").innerHTML = `
    <section class="excel-viewer" aria-label="발주서 엑셀 뷰어">
      <div class="excel-title">발 주 서</div>
      <div class="excel-head-grid">
        <div class="excel-info">
          <div><strong>일련번호</strong><span>${excelOrder.orderNo || ""}</span></div>
          <div><strong>수신</strong><span>${excelOrder.recipient || ""}</span></div>
          <div><strong>참조</strong><span>${excelOrder.reference || ""}</span></div>
          <div><strong>TEL</strong><span>${excelOrder.tel || ""}</span></div>
          <div><strong>FAX</strong><span>${excelOrder.fax || ""}</span></div>
          <div><strong>납기일자</strong><span>${excelOrder.dueDate || ""}</span></div>
        </div>
        <div class="excel-info">
          <div><strong>사업자등록번호</strong><span>${excelOrder.businessNo}</span></div>
          <div><strong>회사명/대표</strong><span>${excelOrder.company}</span></div>
          <div><strong>주소</strong><span>${excelOrder.address}</span></div>
          <div><strong>담당/연락처</strong><span>${excelOrder.manager}</span></div>
        </div>
      </div>

      <table class="excel-viewer-table">
        <thead>
          <tr>
            <th>품목코드</th>
            <th>품목명[규격]</th>
            <th>적요</th>
            <th>수량</th>
            <th>단가</th>
            <th>공급가액</th>
            <th>부가세</th>
          </tr>
        </thead>
        <tbody>
          ${excelOrder.rows.map((row) => `
            <tr>
              <td>${row.code || ""}</td>
              <td>${row.name || ""}</td>
              <td>${row.note || ""}</td>
              <td>${formatNumber.format(row.qty || 0)}</td>
              <td>${formatNumber.format(row.unitPrice || 0)}</td>
              <td>${formatNumber.format(row.supplyAmount || 0)}</td>
              <td>${formatNumber.format(row.vat || 0)}</td>
            </tr>
          `).join("")}
          ${Array.from({ length: blankRows }, () => `
            <tr class="blank-row">
              <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5">합계</td>
            <td>${formatNumber.format(supplyAmount)}</td>
            <td>${formatNumber.format(vat)}</td>
          </tr>
          <tr>
            <td colspan="5">총액</td>
            <td colspan="2">${formatCurrency.format(supplyAmount + vat)}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  `;
}

function openStoredPurchaseOrder(orderId) {
  const order = purchaseOrders.find((item) => item.id === orderId);
  if (!order) {
    showToast("발주서를 찾을 수 없습니다.");
    return;
  }

  renderOrderViewer(order);
  const modal = document.querySelector("#orderViewerModal");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeOrderViewer() {
  const modal = document.querySelector("#orderViewerModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function renderOrderPreview() {
  const rows = getFilteredMaterialMasters()
    .filter((row) => row.recommendedQty > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore);
  const editor = document.querySelector("#orderEditor");
  if (rows.length === 0) {
    editor.innerHTML = `<div class="empty-state">발주서 작성 대상이 없습니다.</div>`;
    return;
  }

  const defaultOrderNo = getNextPurchaseOrderNo();
  editor.innerHTML = `
    <section class="po-editor">
      <div class="order-summary">
        <span>선택 품목 <strong id="orderItemCount">0개</strong></span>
        <span>예상 금액 <strong id="orderTotalAmount">${formatCurrency.format(0)}</strong></span>
      </div>

      <div class="po-form-grid">
        <label>
          <span>일련번호</span>
          <input id="poOrderNo" type="text" value="${defaultOrderNo}" />
        </label>
        <label>
          <span>수신</span>
          <input id="poRecipient" type="text" />
        </label>
        <label>
          <span>참조</span>
          <input id="poReference" type="text" />
        </label>
        <label>
          <span>TEL</span>
          <input id="poTel" type="text" />
        </label>
        <label>
          <span>FAX</span>
          <input id="poFax" type="text" />
        </label>
        <label>
          <span>납기일자</span>
          <input id="poDueDate" type="text" value="ASAP" />
        </label>
      </div>

      <div class="po-company">
        <span>사업자등록번호 <strong>383-88-01197</strong></span>
        <span>회사명/대표 <strong>코넥스온텍 / 이오영</strong></span>
        <span>주소 <strong>경기도 시흥시 정왕천로 155 a동 201호(정왕동)</strong></span>
        <span>담당/연락처 <strong>오정석 / 010-8455-6775</strong></span>
      </div>

      <div class="table-wrap">
        <table class="data-table data-table--fluid po-table">
          <thead>
            <tr>
              <th>선택</th>
              <th>품목코드</th>
              <th>품목명[규격]</th>
              <th>적요</th>
              <th>수량</th>
              <th>단가</th>
              <th>공급가액</th>
              <th>부가세</th>
            </tr>
          </thead>
          <tbody id="poItemTable">
            ${rows.map((row) => `
              <tr>
                <td class="select-cell">
                  <input data-po-field="selected" type="checkbox" aria-label="${row.name} 발주 선택" />
                </td>
                <td><input data-po-field="code" type="text" value="${row.code}" /></td>
                <td><input data-po-field="name" type="text" value="${row.name}" /></td>
                <td><input data-po-field="note" type="text" /></td>
                <td><input data-po-field="qty" type="number" min="0" step="1" /></td>
                <td><input data-po-field="unitPrice" type="number" min="0" step="1" value="${row.unitPrice}" /></td>
                <td data-po-field="supply"></td>
                <td data-po-field="vat"></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function readOrderEditor() {
  const rows = Array.from(document.querySelectorAll("#poItemTable tr")).map((row) => {
    const getInput = (field) => row.querySelector(`[data-po-field="${field}"]`)?.value.trim() || "";
    const selected = row.querySelector('[data-po-field="selected"]')?.checked || false;
    const qty = Number(getInput("qty")) || 0;
    const unitPrice = Number(getInput("unitPrice")) || 0;
    return {
      selected,
      code: getInput("code"),
      name: getInput("name"),
      note: getInput("note"),
      qty,
      unitPrice,
      supplyAmount: qty * unitPrice,
      vat: Math.round(qty * unitPrice * 0.1),
    };
  }).filter((row) => row.selected);

  return {
    orderNo: document.querySelector("#poOrderNo")?.value.trim() || "",
    recipient: document.querySelector("#poRecipient")?.value.trim() || "",
    reference: document.querySelector("#poReference")?.value.trim() || "",
    tel: document.querySelector("#poTel")?.value.trim() || "",
    fax: document.querySelector("#poFax")?.value.trim() || "",
    dueDate: document.querySelector("#poDueDate")?.value.trim() || "ASAP",
    businessNo: "383-88-01197",
    company: "코넥스온텍 / 이오영",
    address: "경기도 시흥시 정왕천로 155 a동 201호(정왕동)",
    manager: "오정석 / 010-8455-6775",
    rows,
  };
}

function updateOrderEditorTotals() {
  const order = readOrderEditor();
  let total = 0;

  document.querySelectorAll("#poItemTable tr").forEach((row) => {
    const selected = row.querySelector('[data-po-field="selected"]')?.checked || false;
    const qtyInput = row.querySelector('[data-po-field="qty"]');
    const unitPriceInput = row.querySelector('[data-po-field="unitPrice"]');
    const qty = Number(qtyInput?.value) || 0;
    const unitPrice = Number(unitPriceInput?.value) || 0;
    const supply = qty * unitPrice;
    const vat = Math.round(supply * 0.1);
    if (selected) {
      total += supply;
    }
    row.querySelector('[data-po-field="supply"]').textContent = qtyInput?.value ? formatNumber.format(supply) : "";
    row.querySelector('[data-po-field="vat"]').textContent = qtyInput?.value ? formatNumber.format(vat) : "";
  });

  document.querySelector("#orderItemCount").textContent = `${order.rows.length}개`;
  document.querySelector("#orderTotalAmount").textContent = formatCurrency.format(total);
}

function xmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function findTemplateFile(name) {
  return PURCHASE_ORDER_TEMPLATE_FILES.find((file) => file.name === name)?.content || "";
}

function replaceWorkbookCalcMode(xml) {
  return xml.replace(/<calcPr[^>]*\/>/, '<calcPr calcId="191029" fullCalcOnLoad="1" forceFullCalc="1"/>');
}

function getExistingCellStyle(xml, ref) {
  const escapedRef = ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(new RegExp(`<c r="${escapedRef}"[^>]*/>|<c r="${escapedRef}"[^>]*>[\\s\\S]*?<\\/c>`));
  return match?.[0].match(/\ss="[^"]+"/)?.[0] || "";
}

function replaceCellXml(xml, ref, cellXml) {
  const escapedRef = ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<c r="${escapedRef}"[^>]*/>|<c r="${escapedRef}"[^>]*>[\\s\\S]*?<\\/c>`);
  if (pattern.test(xml)) {
    return xml.replace(pattern, cellXml);
  }

  const rowNumber = ref.match(/\d+/)?.[0];
  if (!rowNumber) return xml;
  return xml.replace(new RegExp(`(<row r="${rowNumber}"[^>]*>)`), `$1${cellXml}`);
}

function setTemplateTextCell(xml, ref, value, styleOverride) {
  const style = styleOverride || getExistingCellStyle(xml, ref);
  const cellXml = value === "" || value === null || value === undefined
    ? `<c r="${ref}"${style}/>`
    : `<c r="${ref}"${style} t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`;
  return replaceCellXml(xml, ref, cellXml);
}

function setTemplateNumberCell(xml, ref, value, styleOverride) {
  const style = styleOverride || getExistingCellStyle(xml, ref);
  const numericValue = Number(value) || 0;
  return replaceCellXml(xml, ref, `<c r="${ref}"${style}><v>${numericValue}</v></c>`);
}

function setTemplateFormulaCell(xml, ref, formula, styleOverride) {
  const style = styleOverride || getExistingCellStyle(xml, ref);
  return replaceCellXml(xml, ref, `<c r="${ref}"${style}><f>${xmlEscape(formula)}</f></c>`);
}

function clearTemplateCell(xml, ref) {
  const style = getExistingCellStyle(xml, ref);
  return replaceCellXml(xml, ref, `<c r="${ref}"${style}/>`);
}

function buildWorksheetXml(order) {
  let xml = findTemplateFile("xl/worksheets/sheet1.xml");

  xml = setTemplateTextCell(xml, "D2", order.orderNo);
  xml = setTemplateTextCell(xml, "D3", order.recipient);
  xml = setTemplateTextCell(xml, "D4", order.reference);
  xml = setTemplateTextCell(xml, "D5", order.tel);
  xml = setTemplateTextCell(xml, "D6", order.fax);
  xml = setTemplateTextCell(xml, "A7", `납기일자 : ${order.dueDate}`);
  xml = setTemplateTextCell(xml, "L4", order.businessNo);
  xml = setTemplateTextCell(xml, "L5", order.company);
  xml = setTemplateTextCell(xml, "L6", order.address);
  xml = setTemplateTextCell(xml, "L7", order.manager);

  for (let index = 0; index < 24; index += 1) {
    const rowNumber = 10 + index;
    const item = order.rows[index];
    const refs = ["A", "C", "G", "J", "M", "O", "P"].map((column) => `${column}${rowNumber}`);

    if (!item) {
      refs.forEach((ref) => {
        xml = clearTemplateCell(xml, ref);
      });
      continue;
    }

    xml = setTemplateTextCell(xml, `A${rowNumber}`, item.code, ' s="45"');
    xml = setTemplateTextCell(xml, `C${rowNumber}`, item.name, ' s="45"');
    xml = setTemplateTextCell(xml, `G${rowNumber}`, item.note, ' s="45"');
    xml = setTemplateNumberCell(xml, `J${rowNumber}`, item.qty, ' s="45"');
    xml = setTemplateNumberCell(xml, `M${rowNumber}`, item.unitPrice, ' s="45"');
    xml = setTemplateFormulaCell(xml, `O${rowNumber}`, `J${rowNumber}*M${rowNumber}`, ' s="5"');
    xml = setTemplateFormulaCell(xml, `P${rowNumber}`, `O${rowNumber}*0.1`, ' s="5"');
  }

  xml = setTemplateFormulaCell(xml, "O34", "SUM(O10:O33)");
  return xml;
}

function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function pushUint16(array, value) {
  array.push(value & 0xff, (value >>> 8) & 0xff);
}

function pushUint32(array, value) {
  array.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function createZip(files) {
  const encoder = new TextEncoder();
  const now = dosDateTime(new Date());
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const checksum = crc32(dataBytes);
    const local = [];
    pushUint32(local, 0x04034b50);
    pushUint16(local, 20);
    pushUint16(local, 0);
    pushUint16(local, 0);
    pushUint16(local, now.time);
    pushUint16(local, now.date);
    pushUint32(local, checksum);
    pushUint32(local, dataBytes.length);
    pushUint32(local, dataBytes.length);
    pushUint16(local, nameBytes.length);
    pushUint16(local, 0);
    localParts.push(new Uint8Array([...local, ...nameBytes, ...dataBytes]));

    const central = [];
    pushUint32(central, 0x02014b50);
    pushUint16(central, 20);
    pushUint16(central, 20);
    pushUint16(central, 0);
    pushUint16(central, 0);
    pushUint16(central, now.time);
    pushUint16(central, now.date);
    pushUint32(central, checksum);
    pushUint32(central, dataBytes.length);
    pushUint32(central, dataBytes.length);
    pushUint16(central, nameBytes.length);
    pushUint16(central, 0);
    pushUint16(central, 0);
    pushUint16(central, 0);
    pushUint16(central, 0);
    pushUint32(central, 0);
    pushUint32(central, offset);
    centralParts.push(new Uint8Array([...central, ...nameBytes]));
    offset += local.length + nameBytes.length + dataBytes.length;
  });

  const centralOffset = offset;
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = [];
  pushUint32(end, 0x06054b50);
  pushUint16(end, 0);
  pushUint16(end, 0);
  pushUint16(end, files.length);
  pushUint16(end, files.length);
  pushUint32(end, centralSize);
  pushUint32(end, centralOffset);
  pushUint16(end, 0);

  return new Blob([...localParts, ...centralParts, new Uint8Array(end)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function buildPurchaseOrderXlsx(order) {
  const files = PURCHASE_ORDER_TEMPLATE_FILES.map((file) => {
    if (file.name === "xl/worksheets/sheet1.xml") {
      return { name: file.name, content: buildWorksheetXml(order) };
    }
    if (file.name === "xl/workbook.xml") {
      return { name: file.name, content: replaceWorkbookCalcMode(file.content) };
    }
    return file;
  });

  return createZip(files);
}

function downloadPurchaseOrder() {
  const order = readOrderEditor();
  if (order.rows.length === 0) {
    showToast("발주할 품목을 선택하세요.");
    return;
  }
  if (order.rows.some((row) => row.qty <= 0)) {
    showToast("선택한 품목의 수량을 입력하세요.");
    return;
  }

  const blob = buildPurchaseOrderXlsx(order);
  const link = document.createElement("a");
  const safeOrderNo = order.orderNo.replace(/[^\w가-힣.-]+/g, "_") || "draft";
  link.href = URL.createObjectURL(blob);
  link.download = `발주서_${safeOrderNo}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  savePurchaseOrder(order);
  render();
  closeOrderModal();
  showToast("발주서가 저장되고 다운로드되었습니다.");
}

function openOrderModal() {
  renderOrderPreview();
  const modal = document.querySelector("#orderModal");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeOrderModal() {
  const modal = document.querySelector("#orderModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function normalizeMaterialFieldValue(field, value) {
  if (numericMaterialFields.has(field)) {
    return Math.max(0, Number(value) || 0);
  }
  return value.trim();
}

function getMaterialRecords(code) {
  return materials.filter((item) => item.code === code);
}

function persistMaterialChanges(message) {
  writeMaterials(materials);
  plans = buildPlans();
  render();
  if (message) showToast(message);
}

function updateMaterialMaster(input) {
  const code = input.dataset.masterCode;
  const draftId = input.dataset.masterId;
  const field = input.dataset.masterField;
  if ((!code && !draftId) || !field) return;
  const value = normalizeMaterialFieldValue(field, input.value);
  const records = draftId
    ? materials.filter((item) => item.draftId === draftId)
    : getMaterialRecords(code);
  if (records.length === 0) return;

  if (field === "code") {
    if (!value) {
      if (!draftId) {
        showToast("자재코드는 비워둘 수 없습니다.");
        render();
      }
      return;
    }
    if (value !== code && materials.some((item) => item.code === value)) {
      showToast("이미 등록된 자재코드입니다.");
      render();
      return;
    }
  }

  records.forEach((item) => {
    item[field] = value;
    if (item.isDraft && item.code && item.name) {
      item.isDraft = false;
      item.draftId = "";
    }
  });
  persistMaterialChanges();
}

function addMaterialMaster() {
  const draftId = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  materials.push({
    itemName: "",
    code: "",
    name: "",
    location: "",
    requiredQty: 0,
    supplier: "",
    stock: 0,
    safetyStock: 0,
    leadTime: 0,
    unitPrice: 0,
    inboundQty: 0,
    inboundDate: null,
    isMasterOnly: true,
    isDraft: true,
    draftId,
  });
  persistMaterialChanges();
  const tableWrap = document.querySelector("#materialInfoTable")?.closest(".table-wrap");
  if (tableWrap) tableWrap.scrollTop = 0;
  document.querySelector(`[data-master-id="${draftId}"][data-master-field="code"]`)?.focus();
  showToast("자재정보에 신규 자재를 추가했습니다.");
}

function deleteMaterialMaster(button) {
  const code = button.dataset.deleteMasterCode;
  const draftId = button.dataset.deleteMasterId;
  const target = draftId
    ? materials.find((item) => item.draftId === draftId)
    : materials.find((item) => item.code === code);
  if (!target) return;

  if (!draftId) {
    const confirmed = window.confirm(`${target.name || target.code} 자재정보와 연결된 명세를 모두 삭제할까요?`);
    if (!confirmed) return;
  }

  const remaining = materials.filter((item) => draftId ? item.draftId !== draftId : item.code !== code);
  materials.splice(0, materials.length, ...remaining);
  persistMaterialChanges(draftId ? "신규 자재 행을 삭제했습니다." : "자재정보를 삭제했습니다.");
}

function setActiveView(viewName) {
  const fallback = pageMeta[viewName] ? viewName : "dashboard";
  if (activeViewName && activeViewName !== fallback) {
    resetTableSortForView(activeViewName);
  }
  activeViewName = fallback;
  document.querySelectorAll("[data-view]").forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === fallback);
  });
  document.querySelectorAll("[data-view-target]").forEach((link) => {
    const active = link.dataset.viewTarget === fallback;
    link.classList.toggle("active", active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  document.querySelector("#pageEyebrow").textContent = pageMeta[fallback][0];
  document.querySelector("#pageTitle").textContent = pageMeta[fallback][1];
  render();
}

document.querySelectorAll("[data-view-target]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const viewName = link.dataset.viewTarget;
    history.pushState(null, "", `#${viewName}`);
    setActiveView(viewName);
  });
});

window.addEventListener("popstate", () => {
  setActiveView(location.hash.replace("#", "") || "dashboard");
});

document.querySelector("#searchInput").addEventListener("input", render);
document.querySelector("#createOrderButton").addEventListener("click", openOrderModal);
document.querySelector("#confirmOrderButton").addEventListener("click", downloadPurchaseOrder);
document.querySelector("#addMaterialInfoButton").addEventListener("click", addMaterialMaster);
document.querySelector("#jsonUploadButton").addEventListener("click", () => {
  document.querySelector("#jsonUploadInput").click();
});
document.querySelector("#jsonUploadInput").addEventListener("change", (event) => {
  uploadJsonSettings(event.target.files?.[0]);
  event.target.value = "";
});
document.querySelector("#jsonDownloadButton").addEventListener("click", downloadJsonSettings);
document.querySelector("#resetDataButton").addEventListener("click", resetJsonSettings);
document.querySelector("#orderHistoryTable").addEventListener("click", (event) => {
  const button = event.target.closest("[data-order-view-id]");
  if (!button) return;
  openStoredPurchaseOrder(button.dataset.orderViewId);
});
document.querySelector("#materialInfoTable").addEventListener("change", (event) => {
  if (event.target.matches("[data-master-field]")) {
    updateMaterialMaster(event.target);
  }
});
document.querySelector("#materialInfoTable").addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-master-code], [data-delete-master-id]");
  if (button) deleteMaterialMaster(button);
});
document.querySelector("#productionProductList").addEventListener("input", (event) => {
  if (!event.target.matches("[data-production-item]")) return;
  productionTargets[event.target.dataset.productionItem] = Math.max(0, Number(event.target.value) || 0);
  renderProductionAnalysis();
});
document.querySelector("#orderEditor").addEventListener("input", (event) => {
  if (event.target.matches('[data-po-field="qty"], [data-po-field="unitPrice"]')) {
    updateOrderEditorTotals();
  }
});
document.querySelector("#orderEditor").addEventListener("change", (event) => {
  if (event.target.matches('[data-po-field="selected"]')) {
    updateOrderEditorTotals();
  }
});
document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeOrderModal);
});
document.querySelectorAll("[data-close-viewer-modal]").forEach((button) => {
  button.addEventListener("click", closeOrderViewer);
});
document.querySelectorAll("[data-inbound-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    activeInboundSort = button.dataset.inboundSort;
    document.querySelectorAll("[data-inbound-sort]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    render();
  });
});
document.querySelectorAll("[data-inventory-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    activeInventorySort = button.dataset.inventorySort;
    document.querySelectorAll("[data-inventory-sort]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    render();
  });
});
document.querySelectorAll("[data-lead-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    activeLeadSort = button.dataset.leadSort;
    document.querySelectorAll("[data-lead-sort]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    render();
  });
});
document.querySelectorAll("[data-sort-table]").forEach((button) => {
  button.addEventListener("click", () => {
    const tableName = button.dataset.sortTable;
    const sortKey = button.dataset.sortKey;
    const current = tableSortState[tableName];
    tableSortState[tableName] = {
      key: sortKey,
      direction: current?.key === sortKey && current.direction === "asc" ? "desc" : "asc",
    };
    render();
  });
});
setActiveView(location.hash.replace("#", "") || "dashboard");
