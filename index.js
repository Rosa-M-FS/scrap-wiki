const axios = require('axios')
const cheerio=require('cheerio')
const express=require('express')
const app=express();

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap'
/* const dataLinks=[]; */

const baseUrl = 'https://es.wikipedia.org/wiki'; // URL base
app.get('/', async (req,res)=>{
    try{
        const response = await axios.get(url);

        if (response.status===200){
            const html=response.data
            const $=cheerio.load(html);

            //encontrar links
            const links =[];
            $('#mw-pages a').each((index,element)=>{
                const link = $(element).attr('href');
                if(link){
                    const linkUrl=link.startsWith('http') ? link : baseUrl + link;
                    console.log(linkUrl)
                    links.push(linkUrl)
                }

            });
            //Comprobar si hay enlaces o no 
            if (links.length === 0) {
                console.log('No se encontraron enlaces dentro de #mw-pages');
            } else {
                console.log('Enlaces encontrados:', links.length);  // Nº enlaces encontrados
            }

            //dentro de cada link 
            const promises= links.map(link=>scrapingInternal(link));

            const interns = await Promise.all(promises);
            res.json(interns);
        
            /*             
            dataLinks.push(...interns); */
        }
    } catch (error){
        console.error(`Error datos de ${url}, ${error.message}`);
        res.status(500).send('Error scraping')
    }
});

            /*res.send(`<h1>${pageTitle}</h1>
                <h2>Enlaces</h2>
                <ul>
                ${links.map(link =>`<li><a href="${url}${link}">${link}</a></li>`).join('')}
                </ul>
                <h2>imágenes</h2>
                <ul>
                ${imgs.map(img =>`<li><a href="${url}${img}">${img}</a></li>`).join('')}
                </ul>
                <h2>parrafos</h2>
                <ul>
                ${paragraphs.map(paragraph =>`<li>${paragraph}</li>`).join('')}
                </ul>
                `
            ) */

const scrapingInternal = async (urlLinks) =>{
    try {
        const response = await axios.get(urlLinks);
        
        if (response.status===200){
            const html=response.data

            const $=cheerio.load(html)

            const title=$('h1').text();
            const imgs =[];
            const paragraphs =[];

            $('img').each((index,element)=>{
                const img =$(element).attr('src')
                imgs.push(img)
            })
            
            $('p').each((index,element)=>{
                const paragraph =$(element).text()
                paragraphs.push(paragraph)
            })

            console.log(`Scrape exitoso: ${title}`);
            return { title, images:imgs, paragraphs };
            /* dataLinks.push({title,images,paragraphs}); */
     
        }
    } catch(error){
        console.error(`Error en ${urlLinks}:${error.message}`)
        return {error:`Error en datos de ${urlLinks}:${error.message}`}
    }
};




app.listen(3000,()=>{
    console.log('Express está escuchando en el puerto http://localhost:3000')
})