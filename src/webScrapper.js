const { chromium, firefox, webkit } = require('playwright')

const TIMEOUT = 50000000

let initialUrl = ""

//create the correct url
function createUrl(arrayUrl){
    let splitUrl = arrayUrl.split('/')
    let url = ""
    for(let i=0 ; i<splitUrl.length - 1; i++){
        if(i != 0){
            url += "/"+splitUrl[i]
        }else{
            url += splitUrl[i]
        }
        
    }
    url += "/paginated"
    return url
}

async function readWeb(request, response, next){
    initialUrl = "https://lectortmo.com/library/manhwa/73184/la-tirana-quiere-tener-una-buena-vida"
    const url = request.body.input_link //! change
    const browser = await firefox.launch({headless: false})
    const page = await browser.newPage()
    await page.goto(initialUrl)
    await getLinks(page)
    await browser.close()
    response.status(200).send('Reading....')
}

async function getLinks(page){
    const urls = []
    await page.click('#show-chapters',{timeout: TIMEOUT})
    //querySelectorAll
    const list = await page.locator('.list-group ul > li > div > div > a',{timeout:TIMEOUT})
    // get the hrefs
    for (let i = 0; i < await list.count(); i++) {
        let url = await list.nth(i).getAttribute('href')
        urls.push(url)
    }

    // get the links
    await download(page, urls)
    
    //await page.screenshot({ path: 'screenshot.png' })
}

async function download(page, urls){
    let lastNumber

    for (let i = urls.length - 1; i >= 0; i--) {
        await page.goto(urls[i], {timeout: TIMEOUT})
        let actualUrl = await page.url()
        let newUrl = createUrl(actualUrl)
        // redirect to a new page
        await page.goto(newUrl, {timeout:TIMEOUT})
        const titleText = await page.innerText('.container-fluid > div > div > h2')
        let titleNumber = titleText.split(' ')[1]

        const listSelect = await page.$eval('select#viewer-pages-select option', sel => sel.value)
        console.log(listSelect)

        // take screenshot to a img
        //await page.locator('.viewer-image', {timeout:TIMEOUT}).screenshot({path:'screenshot.jpg'})
        
        // check if is made
        if(lastNumber != titleNumber){
            console.log(titleNumber)
            
            //await page.goto(initialUrl, {timeout: TIMEOUT})
        }
        lastNumber = titleNumber
        break
    }
}

module.exports = {readWeb}