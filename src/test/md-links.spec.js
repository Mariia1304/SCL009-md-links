const mdLinks = require("../md-links");


// describe('mdLinks', () => {

//   it('should...', () => {
//     console.log('FIX ME!');
//   });

// });
describe('mdLinks', () =>{
   it('it should return 2 links when necessary to read the file prueba.md', async()=>{
     await expect(mdLinks.mdLinks('./prueba.md')).resolves.toEqual(
       'https://nodejs.org/es/about/ /Users/maria/Desktop/SCL009-md-links/prueba.md Acerca de Node.js - Documentación oficial',
       'https://nodejs.org/api/fs.html /Users/maria/Desktop/SCL009-md-links/prueba.md Node.js file system - Documentación oficial'
     )
   })
})
