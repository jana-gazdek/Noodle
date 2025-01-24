exports.seed = async function(knex) {
    await knex('REPOZITORIJ').del();
    await knex('RASPORED').del();
    await knex('UČENIK').del();
    await knex('DJELATNIK').del();
    await knex('GOST').del();
    await knex('PREDMET').del();
    await knex('PROSTORIJA').del();
    await knex('KORISNIK').del();
    await knex('ŠKOLA').del();
    
    const schools = await knex('ŠKOLA').insert([
      { školaID: 1, imeŠkole: 'TEST-SCHOOL' }
    ]).returning('*');
    
    await knex('REPOZITORIJ').insert([
      { repID: '1I9H0ooP32aYfxf30jwJscSvHoMGa70FK', imeRep: 'Noodle', školaID: schools[0].školaID }
    ]);
    
    /*const users = await knex('KORISNIK').insert([
    { OIB: '12345678901', spol: 'M', ime: 'Ivan', prezime: 'Horvat', datumRod: '2000-01-01', adresa: 'Zagreb', email: 'ivan@example.com', zaporka: 'hashedpassword', školaID: schools[0].školaID }
     ]).returning('*');*/
};