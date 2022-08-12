import * as puppeteer from "puppeteer";
import { Page } from "puppeteer";

const searchInput = async (page: Page, searchTerm: string) =>
  page.$eval<string, any>(
    'input[title="Search"]',
    (el: HTMLInputElement, term: string) => (el.value = term),
    searchTerm
  );

const pressSearchButton = async (page: Page) =>
  page.$eval<string, any>(
    'input[value="Google Search"]',
    (el: HTMLInputElement) => el.click()
  );

const scrapeSearchResults = async (page: Page) =>
  page.$$eval<string, any[]>(".LC20lb", (els: any[]) => {
    return els.map(
      (e: { innerText: string; parentNode: { href: string } }) => ({
        title: e.innerText,
        link: e.parentNode.href,
      })
    );
  });

const setup = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(`https://www.google.com/`);
  return { page, browser };
};

const scrape = async () => {
  const { page, browser } = await setup();
  const searchTerm = "poison";
  await searchInput(page, searchTerm);
  await pressSearchButton(page);

  // wait for selector to load & be visible
  await page.waitForSelector(".v7W49e", { visible: true });

  const searchResults = await scrapeSearchResults(page);
  console.log("Results:", searchResults);
  await browser.close();
};

scrape();
