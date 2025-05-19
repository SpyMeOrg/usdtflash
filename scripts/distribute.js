// سكريبت توزيع توكنات FakeUSDT على محافظ حقيقية
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("بدء عملية توزيع توكنات FakeUSDT...");

  // قراءة معلومات العقد من الملف
  const fs = require("fs");
  let contractInfo;
  try {
    contractInfo = JSON.parse(fs.readFileSync("fake-usdt-info.json", "utf8"));
  } catch (error) {
    console.error("خطأ: لم يتم العثور على ملف معلومات العقد. يرجى تشغيل سكريبت النشر أولاً.");
    process.exit(1);
  }

  // الحصول على عنوان العقد
  const fakeUSDTAddress = contractInfo.address;
  console.log(`عنوان عقد FakeUSDT: ${fakeUSDTAddress}`);

  // الحصول على الحساب الذي سيقوم بتوزيع التوكنات
  const [distributor] = await hre.ethers.getSigners();
  console.log(`توزيع التوكنات باستخدام الحساب: ${distributor.address}`);

  // الاتصال بالعقد
  const FakeUSDT = await hre.ethers.getContractFactory("FakeUSDT");
  const fakeUSDT = FakeUSDT.attach(fakeUSDTAddress);

  // الحصول على قائمة العناوين المستهدفة من ملف .env
  const targetAddressesString = process.env.TARGET_ADDRESSES;
  if (!targetAddressesString) {
    console.error("خطأ: لم يتم تحديد عناوين المحافظ المستهدفة في ملف .env");
    console.log("يرجى إضافة TARGET_ADDRESSES=address1,address2,address3 إلى ملف .env");
    process.exit(1);
  }

  const targetAddresses = targetAddressesString.split(",").map(addr => addr.trim());
  console.log(`عدد العناوين المستهدفة: ${targetAddresses.length}`);

  // كمية التوكنات التي سيتم إرسالها لكل عنوان (1000 USDT)
  // ملاحظة: USDT له 6 كسور عشرية، لذلك 1000 USDT = 1000 * 10^6
  const amount = hre.ethers.parseUnits("1000", 6);

  // توزيع التوكنات على كل عنوان
  const distributionResults = [];
  for (let i = 0; i < targetAddresses.length; i++) {
    const address = targetAddresses[i];
    console.log(`[${i + 1}/${targetAddresses.length}] إرسال ${hre.ethers.formatUnits(amount, 6)} USDT إلى ${address}...`);

    try {
      // إنشاء توكنات جديدة وإرسالها إلى العنوان المستهدف
      const tx = await fakeUSDT.mint(address, amount);
      const receipt = await tx.wait();

      console.log(`تمت العملية بنجاح! رقم المعاملة: ${receipt.hash}`);
      
      // حفظ معلومات التوزيع
      distributionResults.push({
        address,
        amount: hre.ethers.formatUnits(amount, 6),
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`خطأ في إرسال التوكنات إلى ${address}:`, error.message);
    }
  }

  // حفظ نتائج التوزيع في ملف
  fs.writeFileSync(
    "distribution-results.json",
    JSON.stringify(distributionResults, null, 2)
  );
  console.log("تم حفظ نتائج التوزيع في ملف distribution-results.json");

  // عرض معلومات العقد بعد التوزيع
  console.log("\nمعلومات العقد بعد التوزيع:");
  console.log(`العرض الكلي: ${await fakeUSDT.totalSupply()} (${hre.ethers.formatUnits(await fakeUSDT.totalSupply(), 6)} USDT)`);

  console.log("\nتحذير: هذا العقد مخصص للأغراض التعليمية فقط ولا يجب استخدامه في أي نشاط احتيالي.");
  console.log("عنوان USDT الرسمي على شبكة Ethereum هو: 0xdAC17F958D2ee523a2206206994597C13D831ec7");
  console.log(`عنوان العقد المزيف هو: ${fakeUSDTAddress}`);
  
  // عرض روابط Etherscan للمعاملات
  console.log("\nروابط Etherscan للمعاملات:");
  const networkName = hre.network.name;
  const etherscanBaseUrl = networkName === "mainnet" 
    ? "https://etherscan.io" 
    : `https://${networkName}.etherscan.io`;
  
  distributionResults.forEach((result, index) => {
    console.log(`[${index + 1}] ${etherscanBaseUrl}/tx/${result.txHash}`);
  });
}

// تنفيذ السكريبت
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
