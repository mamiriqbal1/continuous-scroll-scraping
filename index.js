const puppeteer = require('puppeteer')
const fs = require('fs');

function extractItems() {
  /*  For extractedElements, you are selecting the tag and class,
      that holds your desired information,
      then choosing the disired child element you would like to scrape from.
    */
   
    const extractedElements = document.querySelectorAll('.quote');
    // Convert the quoteList to an iterable array
    // For each quote fetch the text and author
    return Array.from(extractedElements).map((quote) => {
      // Get the sub-elements from the previously fetched quote element
      const text = quote.querySelector(".text").innerText;
      const author = quote.querySelector(".author").innerText;

      return { text, author };
    });
  }

async function scrapeItems(
  page,
  extractItems,
  itemCount,
  scrollDelay = 800,
) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitForTimeout(scrollDelay);
    }
  } catch(e) { }
  return items;
}


const getQuotes = async () => {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will in full width and height)
  const browser = await puppeteer.launch();

  // Open a new page
  const page = await browser.newPage();

  // On this new page:
  // - open the "http://quotes.toscrape.com/" website
  // - wait until the dom content is loaded (HTML is ready)
  await page.goto("http://quotes.toscrape.com/scroll", {
    waitUntil: "domcontentloaded",
  });

  // Auto-scroll and extract desired items from the page. Currently set to extract ten items.
  const items = await scrapeItems(page, extractItems, 100);
  // Save extracted items to a new file.
  // save courses to JSON file
  fs.writeFile('quotes.json', JSON.stringify(items), (err) => {
      if(err) throw err;
      console.log('File saved');
  });

  // Display the quotes
  console.log(items);

  // Close the browser
  await browser.close();
};

// Start the scraping
getQuotes();
