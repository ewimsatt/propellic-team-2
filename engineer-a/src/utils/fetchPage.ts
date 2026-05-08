import puppeteer from "puppeteer";

export interface FetchedPage {
  html: string;
  screenshotBase64: string;
  finalUrl: string;
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 20000,
    });

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const finalUrl = page.url();
    const html = await page.content();

    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 80,
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });

    const screenshotBase64 = Buffer.from(screenshotBuffer).toString("base64");

    return { html, screenshotBase64, finalUrl };
  } finally {
    await browser.close();
  }
}
