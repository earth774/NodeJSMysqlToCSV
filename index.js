'use strict';

const fs = require('fs');

var mysql = require('mysql');
const util = require('util');

const express = require('express')
const app = express()
const port = 3000
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var con = mysql.createPool({
  host: "localhost",
  socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
  user: "root",
  password: "root",
  database: "sampran_ecommerce_cloud",
  charset: 'utf8'
});

const query = util.promisify(con.query).bind(con);

app.get('/', async (req, res) => {
  let result = await query("SELECT user.username,user.fullname,user_questionnaire_info.* FROM `user_questionnaire_info` INNER JOIN `user` ON user.id =user_questionnaire_info.user_id  where user_questionnaire_info.status_id = 1");
  result.map(data => {
    data.answer = JSON.parse(data.answer);
    return data;
  })
  res.json({
    status: 'success',
    data: result
  });

})

app.get('/excel', async (req, res) => {
  let result = await query("SELECT user.username,user.fullname,user_questionnaire_info.* FROM `user_questionnaire_info` INNER JOIN `user` ON user.id =user_questionnaire_info.user_id  where user_questionnaire_info.status_id = 1");
  result.map(data => {
    data.answer = JSON.parse(data.answer);
    return data;
  })
  let data = [];
  for (let info of result) {
    let district = await query("SELECT * FROM `district` where id = ?", [info.answer.general[0].district])
    let amphur = await query("SELECT * FROM `amphur` where id = ?", [info.answer.general[0].amphur])
    let province = await query("SELECT * FROM `province` where id = ?", [info.answer.general[0].province])
    let info_csv = await {
      fullname: info.fullname,
      tel: info.answer.general[0].tel,
      lineID: info.answer.general[0].lineID,
      address: info.answer.general[0].address,
      district: (district[0] == undefined) ? "" : district[0]["name_th"],
      amphur: (amphur[0] == undefined) ? "" : amphur[0]["name_th"],
      province: (province[0] == undefined) ? "" : province[0]["name_th"],
      zip_code: info.answer.general[0].zip_code,
    };



    data.push(info_csv)
  }

  const csvWriter = createCsvWriter({
    path: 'path/to/file.csv',
    header: [{
        id: 'fullname',
        title: 'ชื่อ-นามสกุล'
      },
      {
        id: 'tel',
        title: 'เบอร์โทรศัพท์'
      },
      {
        id: 'lineID',
        title: 'Line id'
      },
      {
        id: 'address',
        title: 'ที่อยู่'
      },
      {
        id: 'district',
        title: 'ตำบล/แขวง'
      },
      {
        id: 'amphoe',
        title: 'อำเภอ/เขต'
      },
      {
        id: 'province',
        title: 'จังหวัด'
      },
      {
        id: 'zip_code',
        title: 'รหัสไปรษณีย์'
      },
    ]
  });
  csvWriter.writeRecords(data) // returns a promise
    .then(() => {
      console.log('...Done');
    });
  res.json({
    status: 'success',
    data: data
  });

})

app.delete('/user/:id', async (req, res) => {
  let id = req.params.id;
  let result = await query("SELECT * FROM `user_questionnaire_info` where id = " + id);

  let user_questionnaire_info = await query(`UPDATE user_questionnaire_info SET status_id = ? WHERE id = ?`, [3, result[0].id]);
  let user = await query(`UPDATE user SET status_id = ? WHERE id = ?`, [3, result[0].user_id]);
  res.json({
    status: 'success',
    data: result[0]
  });

})




app.listen(port, () => console.log(`Example app listening on port ${port}!`))