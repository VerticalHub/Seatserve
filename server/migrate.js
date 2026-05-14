require('dotenv').config({path:'../.env'});
const {Pool}=require('pg');
const fs=require('fs');
const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
p.query(fs.readFileSync('schema.sql','utf8')).then(()=>{console.log('Schema created!');p.end();}).catch(e=>{console.error(e);p.end();});
