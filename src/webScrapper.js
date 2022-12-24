const { chromium, firefox, webkit } = require('playwright')
const mkdirp = require('mkdirp')
const fs = require('fs')
const pdfApi = require('./pdf')

const TIMEOUT = process.env.TIMEOUT

function delay(time) {
    console.log(`Waiting ${time/1000} seconds`)
    return new Promise(resolve => setTimeout(resolve, time));
}

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
    await pdfApi.callPdf()
    /*
    //initialUrl = "https://lectortmo.com/library/manhwa/73184/la-tirana-quiere-tener-una-buena-vida"
    const url = request.body.input_link //! change
    const browser = await firefox.launch({headless: true})
    const page = await browser.newPage()
    await page.goto("https://lectortmo.com/library/manga/70250/fuguushoku-ningyou-tsukai-no-nariagari-bishoujo-ningyou-to-saikyou-made-saikou-soku-de-nobori-tsumeru")
    await delay(TIMEOUT)
    await getLinks(page)
    await browser.close()
    console.log('Success ;D')
    response.status(200).send('Success!')*/
}

async function getLinks(page){

    console.log('get links of each chapter...')
    const urls = []

    const showChapters = await page.$$('#show-chapters')

    if (showChapters.length){
        await page.click('#show-chapters')
    }
    //querySelectorAll
    const list = await page.locator('.list-group ul > li > div > div > a')
    // get the hrefs
    for (let i = 0; i < await list.count(); i++) {
        let url = await list.nth(i).getAttribute('href')
        urls.push(url)
    }

    // get the links
    await download(page, urls)
    
}


async function download(page, urls){
    let listNumber = []
    let lastNumber

    console.log('Prepare for download by chapter ...')
    for (let i = urls.length - 1; i >= 0; i--) {
        await page.goto(urls[i])
        await delay(TIMEOUT)
        let actualUrl = await page.url()
        let newUrl = createUrl(actualUrl)
        
        // redirect to a new page
        console.log('Redirect to paginate state ...')
        await page.goto(newUrl)
        await delay(TIMEOUT)
        const titleText = await page.innerText('.container-fluid > div > div > h2')
        let titleNumber = titleText.split(' ')[1]

        const listSelect = await page.locator('select#viewer-pages-select > option')
       
        for (let i = 0; i < await listSelect.count(); i++) {
            let value = await listSelect.nth(i).getAttribute('value')
            if (!listNumber.some(v => v == value )){
                listNumber.push(value)
            }
        }

        console.log('Number of pages to download ',listNumber.length)

        if(!fs.existsSync('output')){
            console.log('Creating Output ...')
            mkdirp.sync('output')
            console.log('output created ...')
        }

        // check if is made
        if(lastNumber != titleNumber){
            for(let i=0; i<listNumber.length; i++){
                await page.selectOption('[id="viewer-pages-select"]', listNumber[i])
                await page.locator('.viewer-image').screenshot({path:`output/picture${i}.jpg`})
                console.log('Downloaded picture ',i)
                await delay(TIMEOUT)
                break
            }
            //await page.goto(initialUrl, {timeout: TIMEOUT})
        }
        lastNumber = titleNumber
        // create pdf
        //await ilovepdf.callPdf()

        break
    }
}

module.exports = {readWeb}