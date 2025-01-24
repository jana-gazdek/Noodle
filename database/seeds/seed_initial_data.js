exports.seed = async function(knex) {
    await knex('repozitorij').del();
    await knex('raspored').del();
    await knex.raw('"uČenik"').del();
    await knex('djelatnik').del();
    await knex('gost').del();
    await knex('predmet').del();
    await knex('prostorija').del();
    await knex('korisnik').del();
    await knex('škola').del();
    
    const schools = await knex('škola').insert([
      { školaID: 1, imeŠkole: 'TEST-SCHOOL' }
    ]).returning('*');
    
    await knex('repozitorij').insert([
      { repID: '1I9H0ooP32aYfxf30jwJscSvHoMGa70FK', imeRep: 'Noodle', školaID: schools[0].školaID }
    ]);
    
    /*const users = await knex('korisnik').insert([
    { OIB: '12345678901', spol: 'M', ime: 'Ivan', prezime: 'Horvat', datumRod: '2000-01-01', adresa: 'Zagreb', email: 'ivan@example.com', zaporka: 'hashedpassword', školaID: schools[0].školaID }
     ]).returning('*');*/
};