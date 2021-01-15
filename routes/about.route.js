const express = require("express");
const aboutModel = require("../models/about.model")

const router = express.Router();

router.get("/", async function (req, res) {
    const data = await aboutModel.all();
    data[0].jobs="Javascript";
    data[1].jobs="Python";
    data[2].jobs="Mobile Developer";
    data[3].jobs="Java";
    data[4].jobs="Excel";
    res.render('viewAbout/about',{
        lteacher:data
    });
});

module.exports = router;