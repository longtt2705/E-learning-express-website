const express = require('express');

const router = express.Router();

router.get('/', function (req, res) {
    const rowCourses = [
        {CourType: 'finance', CourName: 'Art & Crafts',CourImage: '../public/img/courses/1.jpg',CourPrice:'$15',CourAuImage:'../public/img/authors/1.jpg',CourAuName:'William Parker',CourAuRole:'Developer',CourStudent:'120 Students',CourStar:5,CourNumberRating:245900},
        {CourType: 'design', CourName: 'IT Development',CourImage: '../public/img/courses/2.jpg',CourPrice:'$35',CourAuImage:'../public/img/authors/2.jpg',CourAuName:'William Tanker',CourAuRole:'Developer',CourStudent:'9 Students',CourStar:4,CourNumberRating:174008},
        {CourType: 'web', CourName: 'Graphic Design',CourImage: '../public/img/courses/3.jpg',CourPrice:'$45',CourAuImage:'../public/img/authors/3.jpg',CourAuName:'Park Carry',CourAuRole:'Developer',CourStudent:'100 Students',CourStar:3,CourNumberRating:450607},
        {CourType: 'finance', CourName: 'photo',CourImage: '../public/img/courses/4.jpg',CourPrice:'$25',CourAuImage:'../public/img/authors/4.jpg',CourAuName:'David Top',CourAuRole:'Developer',CourStudent:'130 Students',CourStar:5,CourNumberRating:103208},
        {CourType: 'finance', CourName: 'finance',CourImage: '../public/img/courses/5.jpg',CourPrice:'$65',CourAuImage:'../public/img/authors/5.jpg',CourAuName:'Marry Sup',CourAuRole:'Developer',CourStudent:'3000 Students',CourStar:5,CourNumberRating:205001},
        {CourType: 'design', CourName: 'Socia Media',CourImage: '../public/img/courses/6.jpg',CourPrice:'$75',CourAuImage:'../public/img/authors/6.jpg',CourAuName:'Mora Tr',CourAuRole:'Developer',CourStudent:'350 Students',CourStar:4,CourNumberRating:105740},
        {CourType: 'web', CourName: 'IT Development',CourImage: '../public/img/courses/7.jpg',CourPrice:'$60',CourAuImage:'../public/img/authors/7.jpg',CourAuName:'Lilia Mass',CourAuRole:'Developer',CourStudent:'460 Students',CourStar:4,CourNumberRating:125300},
        {CourType: 'photo', CourName: 'HTML 5',CourImage: '../public/img/courses/8.jpg',CourPrice:'$100',CourAuImage:'../public/img/authors/8.jpg',CourAuName:'Thomas Moore',CourAuRole:'Developer',CourStudent:'200 Students',CourStar:3,CourNumberRating:15402},
      ];
    const rowTopic=[
      {TopicType:'IT',TopicImage:'../public/img/categories/1.jpg'},
      {TopicType:'Design web',TopicImage:'../public/img/categories/2.jpg'},
      {TopicType:'Music',TopicImage:'../public/img/categories/3.jpg'},
      {TopicType:'Business',TopicImage:'../public/img/categories/4.jpg'},
      {TopicType:'Photography',TopicImage:'../public/img/categories/5.jpg'},
      {TopicType:'Social Media',TopicImage:'../public/img/categories/6.jpg'},
    ];
  res.render('home',{
    categories: rowCourses,
    topic: rowTopic,
    empty:  rowCourses.length === 0
  });
  

})

module.exports = router;