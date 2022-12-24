const ILovePDFApi = require('@ilovepdf/ilovepdf-nodejs')
const instance = new ILovePDFApi(process.env.PUBLIC_KEY, process.env.SECRET_KEY)
const fs = require('fs')
const imgToPDF = require('image-to-pdf')

async function callPdf(){
    const pages = [
        "/home/iscoru95/Documentos/Developer/webscrapper/WebScrapper/output/picture0.jpg", // path to the image
        "data:image/jpg;base64,iVBORw...", // base64
        fs.readFileSync('/home/iscoru95/Documentos/Developer/webscrapper/WebScrapper/output/picture0.jpg') // Buffer
    ]

    imgToPDF(pages, imgToPDF.sizes.A4)
    .pipe(fs.createWriteStream('output.pdf'))
    /*try {
        let task = instance.newTask('imagepdf')
        await task.start()
        await task.addFile('output/picture0.jpg')
        await task.process()
        const data = await task.download()
        fs.writeFileSync('output/test.pdf', data) 

    } catch (error) {
        console.log(error)
    }*/
}

module.exports = {callPdf}