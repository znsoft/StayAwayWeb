
const express = require('express')
const app = express()
var port = process.env.PORT || 3000;
var inc = 0;
var start = new Date();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();



function getStamp(){return (start).toString() + " "+(inc++).toString();}


client.query('CREATE TABLE stable (id SERIAL PRIMARY KEY,timestamp date, kind text);', (err, data) => {  if (err)  console.log(err);	});



app.get('/', (req, res) => {

    //client.query('INSERT INTO stable ( timestamp, kind ) VALUES ( $1, $2);', [new Date(),JSON.stringify(req.headers)], (err, data) => { if (err) res.send(err); });

    client.query('SELECT * FROM stable;', (err, data) => {
  if (err)  console.log(err);
	//for (let row of data.rows) {
		res.send(`${data.rows.length} ${port} `+JSON.stringify(data.rows));
		//break;
  		//}
	  //client.end();
	});
})

app.get('/:ur', (req, res) => {
    const ur = req.params.ur;
    //client.query('INSERT INTO stable ( timestamp, kind ) VALUES ( $1, $2);', [new Date(), JSON.stringify(ur)], (err, data) => { if (err) res.send(err); });

    client.query('SELECT * FROM stable;', (err, data) => {
        if (err) console.log(err);
        //for (let row of data.rows) {
res.send(`${data.rows.length} ${port} `+JSON.stringify(data.rows));
//        res.send(JSON.stringify(data.rows));
        //break;
        //}
        //client.end();
    });
})

app.listen(port, () => {
  console.log(`Example app listening at port:${port}`)
})


// postgres://dvmumxutaklrao:87de2911def57ad28e496119aa3b70ac22c507f494310a4628ce8b00dbdf97a8@ec2-3-81-240-17.compute-1.amazonaws.com:5432/d37k5son6uekqh
