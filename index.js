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
      tel: String("/") + info.answer.general[0].tel,
      lineID: String("/") + info.answer.general[0].lineID,
      address: info.answer.general[0].address,
      district: (district[0] == undefined) ? "" : district[0]["name_th"],
      amphur: (amphur[0] == undefined) ? "" : amphur[0]["name_th"],
      province: (province[0] == undefined) ? "" : province[0]["name_th"],
      zip_code: info.answer.general[0].zip_code,
      age: info.answer.general[0].age,
      education: info.answer.general[0].education,
      profession: info.answer.general[0].profession,
      profession_other: info.answer.general[0].profession_other,
      salary: info.answer.general[0].salary,
      consume_per_week: info.answer.general[0].consume_per_week,
      amount_per_meal: info.answer.general[0].amount_per_meal,
      where_to_buy: info.answer.general[0].where_to_buy,
      where_to_buy_other: info.answer.general[0].where_to_buy_other,
      decide_to_buy: info.answer.general[0].decide_to_buy,
      decide_to_buy_other: info.answer.general[0].decide_to_buy_other,
      food_expense: info.answer.general[0].food_expense,
      travel_expense: info.answer.general[0].travel_expense,
      contact: info.answer.general[0].contact,
      contact_other: info.answer.general[0].contact_other,
      travel_amount: info.answer.general[0].travel_amount,
      buy_organic_product: info.answer.organic_product_consumption[0].buy_organic_product,
      where_buy_organic_product: info.answer.organic_product_consumption[0].where_buy_organic_product,
      where_buy_organic_product_other: info.answer.organic_product_consumption[0].where_buy_organic_product_other,
      organic_food_system: info.answer.organic_product_consumption[0].organic_food_system,
      organic_food_system_other: info.answer.organic_product_consumption[0].organic_food_system_other,
      interested_in_organic1: info.answer.interested_in_organic[0].ans,
      interested_in_organic2: info.answer.interested_in_organic[1].ans,
      interested_in_organic3: info.answer.interested_in_organic[2].ans,
      interested_in_organic4: info.answer.interested_in_organic[3].ans,
      interested_in_organic5: info.answer.interested_in_organic[4].ans,
      interested_in_organic6: info.answer.interested_in_organic[5].ans,
      interested_in_organic7: info.answer.interested_in_organic[6].ans,
      interested_in_organic8: info.answer.interested_in_organic[7].ans,
      interested_in_organic9: info.answer.interested_in_organic[8].ans,
      interested_in_organic10: info.answer.interested_in_organic[9].ans,
      interested_in_organic11: info.answer.interested_in_organic[10].ans.question,
      activities_or_operations_and_affiliate_network1: info.answer.activities_or_operations_and_affiliate_network[0].ans,
      activities_or_operations_and_affiliate_network2: info.answer.activities_or_operations_and_affiliate_network[1].ans,
      activities_or_operations_and_affiliate_network3: info.answer.activities_or_operations_and_affiliate_network[2].ans,
      activities_or_operations_and_affiliate_network4: info.answer.activities_or_operations_and_affiliate_network[3].ans,
      activities_or_operations_and_affiliate_network5: info.answer.activities_or_operations_and_affiliate_network[4].ans,
      activities_or_operations_and_affiliate_network6: info.answer.activities_or_operations_and_affiliate_network[5].ans,
      activities_or_operations_and_affiliate_network7: info.answer.activities_or_operations_and_affiliate_network[6].ans,
      activities_or_operations_and_affiliate_network8: info.answer.activities_or_operations_and_affiliate_network[7].ans,
      activities_or_operations_and_affiliate_network9: info.answer.activities_or_operations_and_affiliate_network[8].ans,
      activities_or_operations_and_affiliate_network10: info.answer.activities_or_operations_and_affiliate_network[9].ans,
      activities_or_operations_and_affiliate_network11: info.answer.activities_or_operations_and_affiliate_network[10].ans,
      activities_or_operations_and_affiliate_network12: info.answer.activities_or_operations_and_affiliate_network[11].ans,
      activities_or_operations_and_affiliate_network13: info.answer.activities_or_operations_and_affiliate_network[12].ans.question,
    };



    data.push(info_csv)
  }

  const csvWriter = createCsvWriter({
    path: 'path/to/file.csv',
    header: [{
        id: "fullname",
        title: "ชื่อ"
      },
      {
        id: "tel",
        title: "เบอร์โทรศัพท์"
      },
      {
        id: "lineID",
        title: "ไลน์ID"
      },
      {
        id: "address",
        title: "ที่อยู่"
      },
      {
        id: "district",
        title: "ตำบล"
      },
      {
        id: "amphur",
        title: "อำเภอ"
      },
      {
        id: "province",
        title: "จังหวัด"
      },
      {
        id: "zip_code",
        title: "รหัสไปษณีย์"
      },
      {
        id: "country",
        title: "ประเทศ"
      },
      {
        id: "age",
        title: "ช่วงอายุของผู้ใช้"
      },
      {
        id: "education",
        title: "ระดับการศึกษา "
      },
      {
        id: "profession",
        title: "อาชีพหลักในปัจจุบัน"
      },
      {
        id: "profession_other",
        title: "อาชีพเสริม"
      },
      {
        id: "salary",
        title: "รายได้ครัวเรือนต่อเดือน (บาท)"
      },
      {
        id: "consume_per_week",
        title: "การบริโภคผัก-ผลไม้ต่อสัปดาห์ "
      },
      {
        id: "amount_per_meal",
        title: "ผัก-ผลไม้ที่บริโภคต่อมื้อ"
      },
      {
        id: "where_to_buy",
        title: "สถานที่เลือกซื้อผัก-ผลไม้"
      },
      {
        id: "where_to_buy_other",
        title: "สถานที่เลือกซื่อผัก-ผลไม้ อื่นๆ"
      },
      {
        id: "decide_to_buy",
        title: "ตัดสินใจซื้อเนื่องจาก"
      },
      {
        id: "decide_to_buy_other",
        title: "ตัดสินใจซื้อเนื่องจากอื่นๆ"
      },
      {
        id: "food_expense",
        title: "ค่าใช้จ่ายในด้านอาหารต่อเดือน (บาท)"
      },
      {
        id: "travel_expense",
        title: "ค่าใช้จ่ายในด้านการท่องเที่ยวต่อเดือน (บาท)"
      },
      {
        id: "contact",
        title: "อีเมลล์"
      },
      {
        id: "contact_other",
        title: "ติดต่ออื่นๆ"
      },
      {
        id: "travel_amount",
        title: "ความถี่ในการท่องเที่ยว"
      },

      {
        id: "buy_organic_product",
        title: "ความบ่อยของการซื้อสินค้าอินทรีย์"
      },
      {
        id: "where_buy_organic_product_other",
        title: "สถานที่ซื้อสินค้าอินทรีย์"
      },
      {
        id: "organic_food_system",
        title: "บทบาทหลักในระบบอาหารอินทรีย์"
      },
      {
        id: "organic_food_system_other",
        title: "บทบาทอื่นๆในระบบอาหารอินทรีย์"
      },

      {
        id: "interested_in_organic1",
        title: "ต้องการมีสุขภาพที่ดี"
      },
      {
        id: "interested_in_organic2",
        title: "ต้องการมีชีวิตที่สมดุล"
      },
      {
        id: "interested_in_organic3",
        title: "เป็นของดีที่มีคุณภาพ"
      },
      {
        id: "interested_in_organic4",
        title: "เป็นทางเลือกที่คุ้มค่า"
      },
      {
        id: "interested_in_organic5",
        title: "รู้แหล่งวัตถุดิบ เชื่อมั่นได้"
      },
      {
        id: "interested_in_organic6",
        title: "มีระบบการทำงาโปร่งใส เป็นธรรม"
      },
      {
        id: "interested_in_organic7",
        title: "ร่วมรักษาสิ่งแวดล้อม "
      },
      {
        id: "interested_in_organic8",
        title: "อยากมีส่วนร่วมสร้าง่ระบบอาหารยั่งยืน"
      },
      {
        id: "interested_in_organic9",
        title: "ช่วยสนับสนุนชุมชนเกษตรกร"
      },
      {
        id: "interested_in_organic10",
        title: "เป็นไลฟ์สไตล์ของคนปัจจุบัน"
      },
      {
        id: "interested_in_organic11",
        title: "อื่นๆ"
      },
      {
        id: "activities_or_operations_and_affiliate_network1",
        title: "กิจกรรมฝึกอบรม/Workshop"
      },
      {
        id: "activities_or_operations_and_affiliate_network2",
        title: "กิจกรรมเสวนาแลกเปลี่ยนเรียนรู้"
      },
      {
        id: "activities_or_operations_and_affiliate_network3",
        title: "การเป็นสมาชิกเพื่อซื้อสินค้า Online Market และรับข่าวสาร"
      },
      {
        id: "activities_or_operations_and_affiliate_network4",
        title: "กิจกรรมการท่องเที่ยวเชิงเกษตรอินทรีย์"
      },
      {
        id: "activities_or_operations_and_affiliate_network5",
        title: "การมีส่วนร่วมให้ความคิดเห็น"
      },
      {
        id: "activities_or_operations_and_affiliate_network6",
        title: "การเรียนรู้เรื่องเกษตรอินทรีย์"
      },
      {
        id: "activities_or_operations_and_affiliate_network7",
        title: "การเรียนรู้และมีส่วนร่วมในระบบ PGS(ระบบรับรองแบบมีส่วนร่วม) เช่น ร่วมประชุมกลุ่มเกษตร"
      },
      {
        id: "activities_or_operations_and_affiliate_network8",
        title: "การร่วมสนับสนุนมาตรการรักษาสิ่งแวดล้อม"
      },
      {
        id: "activities_or_operations_and_affiliate_network9",
        title: "หารระบคไผรุหษาปบบ Consulting หรือ Coaching"
      },
      {
        id: "activities_or_operations_and_affiliate_network10",
        title: "การ่วมกิจกรรมออนไลน์ เช่น ตอบคำถามเกม โดยสามารถสะสมแต้มแลกรับรางวัล"
      },
      {
        id: "activities_or_operations_and_affiliate_network11",
        title: "การเชื่อมโยงเครือข่ายธุรกิจ"
      },
      {
        id: "activities_or_operations_and_affiliate_network12",
        title: "การนำความรู้หรือนำงานที่ทำมาร่วมขับเคลื่อน"
      },
      {
        id: "activities_or_operations_and_affiliate_network13",
        title: "อื่นๆ"
      }

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