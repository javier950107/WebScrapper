const ILovePDFApi = require('@ilovepdf/ilovepdf-nodejs');
const ILovePDFFile = require('@ilovepdf/ilovepdf-nodejs/ILovePDFFile');
const fs = require('fs');
const path = require('path')
const mkdirp = require('mkdirp')

function delay(time) {
    console.log(`Waiting ${time/1000} seconds`)
    return new Promise(resolve => setTimeout(resolve, time));
}

async function callPdf(name, number, response){
    let namesJpg =[]

    // create folder download
    if(!fs.existsSync('download')){
        console.log('Creating Download ...')
        mkdirp.sync('download')
        console.log('Download created ...')
    }

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
    let pathPdf = `download/${name} - ${number} Manga.pdf`
    fs.writeFileSync(pathPdf, data)
    fs.rmSync('output',{ recursive: true, force: true})
    // create folder pdf
    
    /*response.download(pathPdf, (err)=>{
        if (err){
            console.log(err)
        }else{
            console.log('Clean Folder')
            fs.rmSync('output',{ recursive: true, force: true})
        }
    })*/
    console.log('Done PDF!')
    //fs.rmSync('output',{ recursive: true, force: true})
}

module.exports = {callPdf}