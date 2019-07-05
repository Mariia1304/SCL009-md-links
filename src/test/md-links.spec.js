const mdLinks = require("../md-links");

describe('mdLinks', () =>{
   it('it should return 2 links when necessary to read the file prueba.md', async()=>{
     await expect(mdLinks.links('./prueba.md')).resolves.toEqual(
        [ { href: 'https://nodejs.org/es/about/',
        text: 'Acerca de Node.js - Documentación oficial',
        file: './prueba.md' },
      { href: 'https://nodejs.org/api/fs.html',
        text: 'Node.js file system - Documentación oficial',
        file: './prueba.md' } ]
     )
   })
   it('deberia retornar array de archivos .md encontrados en directorio', async()=>{
       await expect(mdLinks.extractMdFiles('/Users/maria/Desktop/SCL009-md-links/src')).resolves.toEqual(
           ['/Users/maria/Desktop/SCL009-md-links/src/prueba/prueba4.md','/Users/maria/Desktop/SCL009-md-links/src/prueba2.md','/Users/maria/Desktop/SCL009-md-links/src/prueba3.md','/Users/maria/Desktop/SCL009-md-links/src/test/prueba-stats.md']
       )
   })
   it('debería retornar el objeto con estadisticas de los links', async()=>{
       await expect(mdLinks.statsLinks([ { href: 'https://nodejs.org/es/about/',
       text: 'Acerca de Node.js - Documentación oficial',
       file:
        '/Users/maria/Desktop/SCL009-md-links/src/test/prueba-stats.md',
       statusCode: 200,
       statusText: 'OK' },
     { href: 'https:////nodejs.org/api/fs.html',
       text: 'Node.js file system - Documentación oficial',
       file:
        '/Users/maria/Desktop/SCL009-md-links/src/test/prueba-stats.md',
       statusCode: 0,
       statusText: 'fail' } ])).resolves.toEqual({ "total": 2, "unique": 2, "broken": 1 })
   })
   it('debería retornar objeto que contiene status de link y code de link', async()=>{
       await expect(mdLinks.linksToStatsAndValidate([ { href: 'https://nodejs.org/es/about/',
       text: 'Acerca de Node.js - Documentación oficial',
       file:
        '/Users/maria/Desktop/SCL009-md-links/src/test/prueba-stats.md' },
     { href: 'https:////nodejs.org/api/fs.html',
       text: 'Node.js file system - Documentación oficial',
       file:
        '/Users/maria/Desktop/SCL009-md-links/src/test/prueba-stats.md' } ])).resolves.toEqual([{ href: 'https://nodejs.org/es/about/',
        text: 'Acerca de Node.js - Documentación oficial',
        file:
         '/Users/maria/Desktop/SCL009-md-links/src/test/prueba-stats.md',
        statusCode: 200,
        statusText: 'OK' },
        { href: 'https:////nodejs.org/api/fs.html',
        text: 'Node.js file system - Documentación oficial',
        file:
        '/Users/maria/Desktop/SCL009-md-links/src/test/prueba-stats.md',
        statusCode: 0,
        statusText: 'fail' }
    ])
   })
})
