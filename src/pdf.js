const ILovePDFApi = require('@ilovepdf/ilovepdf-nodejs');
const ILovePDFFile = require('@ilovepdf/ilovepdf-nodejs/ILovePDFFile');
const fs = require('fs');
const path = require('path')

function delay(time) {
    console.log(`Waiting ${time/1000} seconds`)
    return new Promise(resolve => setTimeout(resolve, time));
}

async function callPdf(name, number, response){
    let namesJpg =[]

    try {
        const instance = new ILovePDFApi(process.env.PUBLIC_KEY, process.env.SECRET_KEY)
        let task = instance.newTask('imagepdf')
        await task.start()

        namesJpg = fs.readdirSync('output')

        console.log('Adding pictures')
        for (let i = 0; i < namesJpg.length; i++) {
            const file = new ILovePDFFile(path.resolve(__dirname,`../output/${namesJpg[i]}`))
            await task.addFile(file)
        }
        
        await task.process({margin: 0, pagesize: 'A4'})
        const data = await task.download()
        // path of pdf
        let pathPdf = `output/${name} - ${number} Manga.pdf`
        fs.writeFileSync(pathPdf, data)
        response.download(pathPdf)

        console.log('Done PDF!')

        delay(5000) // delete after 5
        fs.rmSync('output',{ recursive: true, force: true})
        /*fs.readdir('output', (err, files)=>{
            if (err) throw err

            for (const file of files){
                fs.unlink(path.join('output', file))
            }
        })*/

    } catch (error) {
        console.log(error)
    }
}

module.exports = {callPdf}