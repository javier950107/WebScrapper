const ILovePDFApi = require('@ilovepdf/ilovepdf-nodejs');
const ILovePDFFile = require('@ilovepdf/ilovepdf-nodejs/ILovePDFFile');
const fs = require('fs')
const path = require('path')

async function callPdf(){
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
        
        await task.process({margin: 0, pagesize: 'A4'});
        const data = await task.download();
        fs.writeFileSync('output/example.pdf', data)
        console.log('Done PDF!')

    } catch (error) {
        console.log(error)
    }
}

module.exports = {callPdf}