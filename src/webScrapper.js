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

/**
 * This is the soft version to download
 */
async function fastVersion(request, response){
    try {
        const url = request.body.input_link //! change

        const browser = await firefox.launch({headless: true})
        const page = await browser.newPage()
        await page.goto(url)
        await downloadByChapter(page)
        await delay(TIMEOUT)
        await browser.close()
        console.log('Success ;D ')
        return response.status(200).send('Success! <button onclick="history.back()">Try Again!</button>')
        
    } catch (error) {
        console.log('There was an error! Try again ',error)
        fs.rmSync('output',{ recursive: true, force: true})
        return response.status(500).send('There was an error Try Again! <button onclick="history.back()">Try Again!</button>')
    }
}

/**
 * This function download a chapter by link
 */
async function downloadByChapter(page){
    let listNumber = []
    let actualUrl = await page.url()
    const splitUrl = actualUrl.split('/')
    const lastValueUrl = splitUrl[ splitUrl.length - 1 ]
    
    // redirect to a new page
    if (lastValueUrl == "cascade"){
        console.log('Redirect to paginate state ...')
        let newUrl = createUrl(actualUrl)
        await page.waitForLoadState()
        await page.goto(newUrl)
    }

    await delay(TIMEOUT)
    
    const titleText = await page.innerText('.container-fluid > div > div > h2')
    const name = await page.innerText('.container-fluid > div > div > h1')
    const titleNumber = titleText.split(' ')[1]
    
    const listSelect = await page.locator('select#viewer-pages-select > option')

    // name of imgs to download
    for (let i = 0; i < await listSelect.count(); i++) {            
        let value = await listSelect.nth(i).getAttribute('value')        
        if (!listNumber.some(v => v == value )){                    
            listNumber.push(value)
        }
    }
    console.log('Number of pages to download ',listNumber.length)
    // check if exists the output
    if(!fs.existsSync('output')){
        console.log('Creating Output ...')
        mkdirp.sync('output')
        console.log('output created ...')
    }

    for(let i=0; i<listNumber.length; i++){
        await page.selectOption('[id="viewer-pages-select"]', listNumber[i])
        await delay(TIMEOUT)
        await page.locator('.viewer-image').screenshot({path:`output/${name}${titleNumber}_${i}.jpg`})
        console.log('Downloaded picture ',i)
        
    }
    
    // create pdf with name and number of chapter
    //await pdfApi.callPdf(name, titleNumber)
    //await page.goto(initialUrl, {timeout: TIMEOUT})
}

async function readWeb(request, response){
    try {
        const url = request.body.input_link //! change
        const init = request.body.number_init
        const end = request.body.number_end

        if (Number(end) >= Number(init)){
            const browser = await firefox.launch({headless: true})
            const page = await browser.newPage()
            await page.goto(url)
            await delay(TIMEOUT)
            await getLinks(page,response, Number(init), Number(end))
            await browser.close()
            console.log('Success ;D ')
            return response.status(200).send('Success! <button onclick="history.back()">Try Again!</button>')
        }else{
            return response.status(400).send('Error, End must be greater than Init <button onclick="history.back()">Try Again!</button>')
        }

    } catch (error) {
        console.log('There was an error! Try again ',error)
        fs.rmSync('output',{ recursive: true, force: true})
        return response.status(500).send('There was an error Try Again! <button onclick="history.back()">Try Again!</button>')
    }
}

async function getLinks(page, response, init, end){

    console.log('get links of each chapter...')
    const urls = []

    const showChapters = await page.$$('#show-chapters')

    if (showChapters.length){
        await page.click('#show-chapters')
    }
    //querySelectorAll
    const list = await page.locator('.list-group ul > li > div > div > a')
    for (let i = 0; i < await list.count(); i++) {
        let url = await list.nth(i).getAttribute('href')
        urls.push(url)
    }

    // get the links
    await download(page, urls, response, init , end)
    
}


async function download(page, urls, response, init, end){
    let listNumber = []
    let lastNumber

    let numOfProcess = (end - init) + 1
    let countProcess = 0

    console.log('Prepare for download by chapter ...')
   // console.log(urls)
    for (let i = urls.length - 1; i >= 0; i--) {
        console.log('Goto ',urls[i])
        console.log('----------')
        await page.waitForLoadState()
        await page.goto(urls[i])
        // get the name of the url
        let nameUrl = await page.url()
        //get the domain
        let domain = nameUrl.split('/')[2]
        console.log('Name domain', domain)

        if (domain != "lectortmo.com"){
            console.log('Seek another doman ***')
            continue
        }

        console.log(urls[i])
        await delay(TIMEOUT)
        const titleText = await page.innerText('.container-fluid > div > div > h2')
        const name = await page.innerText('.container-fluid > div > div > h1')
        let titleNumber = titleText.split(' ')[1]

        console.log('Number title', Number(titleNumber))

        if(Number(titleNumber) >= init && Number(titleNumber) <= end){
            // check if is made
            if(lastNumber != titleNumber){
                countProcess ++
                let actualUrl = await page.url()
                let newUrl = createUrl(actualUrl)
                
                // redirect to a new page
                console.log('Redirect to paginate state ...')
                await page.waitForLoadState()
                await page.goto(newUrl)
                await delay(TIMEOUT)
    
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

                for(let i=0; i<listNumber.length; i++){
                    await page.selectOption('[id="viewer-pages-select"]', listNumber[i])
                    await page.locator('.viewer-image').screenshot({path:`output/picture${i}.jpg`})
                    console.log('Downloaded picture ',i)
                    await delay(TIMEOUT)
                }
                // create pdf with name and number of chapter
                await pdfApi.callPdf(name, titleNumber)
                //await page.goto(initialUrl, {timeout: TIMEOUT})
            }
            lastNumber = titleNumber

            if (countProcess >= numOfProcess){
                console.log(`Only ${numOfProcess} Process`)
                break
            }
        }
        //break
    }
}

module.exports = {readWeb, fastVersion}