const express = require('express');
const cors = require('cors');
const snowflake = require('snowflake-sdk');
const app = express();
const port = 4000;
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let snowflakeConfig = {
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    password: process.env.SNOWFLAKE_PASSWORD,
    role: process.env.SNOWFLAKE_ROLE,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA
};

const snowflakeConnection = snowflake.createConnection(snowflakeConfig);

const tableName = process.env.SNOWFLAKE_TABLE;

snowflakeConnection.connect((err, conn) => {
    if (err) {
        console.error('Unable to connect: ' + err.message);
    } else {
        console.log('Successfully connected to Snowflake.');
    }
});

let cache = [];

app.post('/uploadData', (req, res) => {
    console.log(cache.length);
    const row = req.body.row;

    const {
        sales_rep_id, 
        sales_quantity, 
        pharmaceutical_name, 
        customer_country, 
        transaction_date, 
        transaction_amount, 
        payment_method
    } = row;

    cache.push(`(
        '${String(sales_rep_id)}', 
        ${Number(sales_quantity)}, 
        '${String(pharmaceutical_name)}', 
        '${String(customer_country)}', 
        '${new Date(transaction_date).toISOString().split('T')[0]}', 
        ${parseFloat(transaction_amount)}, 
        '${String(payment_method)}'
    )`);

    if (req.body.count === req.body.totalRows) {

        const values = cache.join(',');

        const finalQuery = `INSERT INTO ${tableName} (
            sales_rep_id, 
            sales_quantity, 
            pharmaceutical_name, 
            customer_country, 
            transaction_date, 
            transaction_amount, 
            payment_method
        ) 
        SELECT * FROM (VALUES 
            ${values}
        ) AS tmp (
            sales_rep_id, 
            sales_quantity, 
            pharmaceutical_name, 
            customer_country, 
            transaction_date, 
            transaction_amount, 
            payment_method
        )
        WHERE NOT EXISTS (
            SELECT 1 
            FROM ${tableName} 
            WHERE 
                sales_rep_id = tmp.sales_rep_id AND 
                transaction_date = tmp.transaction_date AND 
                transaction_amount = tmp.transaction_amount
        )`

    //    console.log(finalQuery);

        snowflakeConnection.execute({
            sqlText: finalQuery,
            complete: (err, stmt, rows) => {
                if (err) {
                    console.error(`Failed to execute statement due to the following error: ${err.message}`);
                } else {
                    console.log(`Successfully inserted non-duplicate rows.`);
                }
            }
        });

        cache = []; // Clear the cache
    }

    res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});
