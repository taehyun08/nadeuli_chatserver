const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");

router.post("/", async (req, res) => {
  try {
    const { query } = req.body;
    const response = await axios.get(
      `https://www.coupang.com/np/search?component=&q=${query}&channel=user`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      }
    );
    const htmlData = response.data;

    const $ = cheerio.load(htmlData);

    // price 배열 초기화
    const prices = [];

    // 선택자를 사용하여 내부의 요소들을 찾음
    const container = $(".descriptions-inner");

    // 내부의 요소들 중에서 .name과 .price-value인 경우를 찾음
    container.slice(0, 10).each((i, elem) => {
      // // const name = $(elem).find('.name').text().trim();
      const priceText = $(elem).find(".price-value").text().trim();
      // 가격을 숫자로 변환 (예: "12,345" -> 12345)
      const price = parseInt(priceText.replace(/,/g, ""), 10);
      if (!isNaN(price)) {
        prices.push(price);
      }
    });

    // // 평균 가격 계산
    // const averagePrice =
    //   prices.length > 0
    //     ? prices.reduce((acc, val) => acc + val, 0) / prices.length
    //     : 0;

    // // 5초 지연 후 응답
    // setTimeout(() => {
    //   res.json({ averagePrice });
    // }, 5000); // 5000 밀리초 = 5초

    // 결과를 응답으로 보냄 (평균 가격만)
    res.json({ prices });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
