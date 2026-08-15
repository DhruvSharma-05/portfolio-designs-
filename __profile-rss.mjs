import puppeteer from "puppeteer";
import { execSync } from "node:child_process";

const BASE = "https://craftedandcaptured.com";

function rendererWorkingSetMB() {
  // Sum working-set (RSS-equivalent on Windows) of all chrome.exe processes
  // whose command line marks them as --type=renderer, i.e. actual tab processes,
  // not the browser/GPU/network-service processes. This is the same pool
  // Chrome's own Task Manager draws "Memory footprint" from per tab.
  const ps = `
    Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
      Where-Object { $_.CommandLine -match '--type=renderer' } |
      ForEach-Object {
        $p = Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue
        if ($p) { [PSCustomObject]@{ Id=$_.ProcessId; WS=[math]::Round($p.WorkingSet64/1MB,1) } }
      } | ConvertTo-Json
  `;
  const out = execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"')}"`, { encoding: "utf8" });
  let parsed;
  try { parsed = JSON.parse(out); } catch { return { total: null, procs: [] }; }
  const procs = Array.isArray(parsed) ? parsed : [parsed];
  const total = procs.reduce((s, p) => s + (p?.WS || 0), 0);
  return { total: +total.toFixed(1), procs };
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("baseline (blank tab):", JSON.stringify(rendererWorkingSetMB()));

  await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1500));
  console.log("after home load:", JSON.stringify(rendererWorkingSetMB()));

  // client-side SPA navigation (no full reload) through the heavy routes,
  // like a real visitor clicking around
  for (const route of ["/photography", "/about", "/design", "/", "/photography", "/about"]) {
    await page.evaluate((r) => { history.pushState({}, "", r); window.dispatchEvent(new PopStateEvent("popstate")); }, route);
    await new Promise((r) => setTimeout(r, 1200));
    await page.evaluate(async () => {
      for (let i = 0; i < 5; i++) { window.scrollBy(0, window.innerHeight * 0.9); await new Promise((r) => setTimeout(r, 250)); }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 800));
    console.log(`after SPA nav -> ${route}:`, JSON.stringify(rendererWorkingSetMB()));
  }

  console.log("sitting idle 20s on last route...");
  await new Promise((r) => setTimeout(r, 20000));
  console.log("after 20s idle:", JSON.stringify(rendererWorkingSetMB()));

  const client = await page.createCDPSession();
  const metrics = (await client.send("Performance.getMetrics")).metrics;
  console.log("JSHeapUsedSize MB:", +(metrics.find(m => m.name === "JSHeapUsedSize").value / 1048576).toFixed(1));

  await browser.close();
})();
