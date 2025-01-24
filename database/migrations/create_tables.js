exports.up = function(knex) {
    return knex.schema
      .createTable('ŠKOLA', (table) => {
        table.integer('školaID').primary();
        table.string('imeŠkole', 255).notNullable();
      })
      .createTable('KORISNIK', (table) => {
        table.string('OIB', 11).primary();
        table.enu('spol', ['M', 'F']).notNullable();
        table.string('ime', 25).notNullable();
        table.string('prezime', 25).notNullable();
        table.date('datumRod').notNullable();
        table.string('adresa').notNullable();
        table.string('email', 255).notNullable();
        table.string('zaporka', 255).notNullable();
        table.integer('školaID').notNullable().references('školaID').inTable('ŠKOLA').onDelete('CASCADE');
      })
      .createTable('PROSTORIJA', (table) => {
        table.string('oznaka', 20).primary();
        table.string('kapacitet', 6).notNullable();
        table.enu('tipProstorije', ['dvorana', 'učionica']).notNullable();
        table.integer('školaID').notNullable().references('školaID').inTable('ŠKOLA').onDelete('CASCADE');
      })
      .createTable('PREDMET', (table) => {
        table.integer('predmetID').primary();
        table.string('imePredmet', 30).notNullable();
        table.string('brojSatova', 1).notNullable();
        table.string('brojLab', 1).notNullable();
        table.string('godine', 36).notNullable();
        table.string('smjer', 30).notNullable();
        table.integer('školaID').notNullable().references('školaID').inTable('ŠKOLA').onDelete('CASCADE');
      })
      .createTable('GOST', (table) => {
        table.string('gostID').primary();
        table.timestamp('datumPristupa').notNullable();
        table.string('OIB', 11).notNullable().references('OIB').inTable('KORISNIK').onDelete('CASCADE');
      })
      .createTable('DJELATNIK', (table) => {
        table.string('djelatnikID').primary();
        table.string('mobBroj', 12).notNullable();
        table.string('razred', 50).notNullable();
        table.string('razrednik', 50).notNullable();
        table.enu('status', ['admin', 'profesor', 'satničar']).notNullable();
        table.string('OIB', 11).notNullable().references('OIB').inTable('KORISNIK').onDelete('CASCADE');
      })
      .createTable('UČENIK', (table) => {
        table.string('učenikID').primary();
        table.string('razred', 4).notNullable();
        table.string('škGod', 11).notNullable();
        table.string('smjer', 30).notNullable();
        table.string('OIB', 11).notNullable().references('OIB').inTable('KORISNIK').onDelete('CASCADE');
      })
      .createTable('RASPORED', (table) => {
        table.integer('terminID').primary();
        table.integer('dan').notNullable();
        table.time('vrijeme').notNullable();
        table.string('razred', 4).notNullable();
        table.string('oznaka', 20).notNullable().references('oznaka').inTable('PROSTORIJA').onDelete('CASCADE');
      })
      .createTable('REPOZITORIJ', (table) => {
        table.string('repID').primary();
        table.string('imeRep').notNullable();
        table.integer('školaID').notNullable().references('školaID').inTable('ŠKOLA').onDelete('CASCADE');
      });
  };
  
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('REPOZITORIJ')
      .dropTableIfExists('RASPORED')
      .dropTableIfExists('UČENIK')
      .dropTableIfExists('DJELATNIK')
      .dropTableIfExists('GOST')
      .dropTableIfExists('PREDMET')
      .dropTableIfExists('PROSTORIJA')
      .dropTableIfExists('KORISNIK')
      .dropTableIfExists('ŠKOLA');
  };