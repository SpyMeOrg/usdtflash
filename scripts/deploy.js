// سكريبت نشر عقد FakeUSDT على شبكة Ethereum
const hre = require("hardhat");

async function main() {
  console.log("بدء عملية نشر عقد FakeUSDT...");

  // الحصول على الحساب الذي سيقوم بنشر العقد
  const [deployer] = await hre.ethers.getSigners();
  console.log(`نشر العقد باستخدام الحساب: ${deployer.address}`);

  // عرض رصيد الحساب
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`رصيد الحساب: ${hre.ethers.formatEther(balance)} ETH`);

  // نشر العقد
  const FakeUSDT = await hre.ethers.getContractFactory("FakeUSDT");
  const fakeUSDT = await FakeUSDT.deploy();
  await fakeUSDT.waitForDeployment();

  // الحصول على عنوان العقد
  const fakeUSDTAddress = await fakeUSDT.getAddress();
  console.log(`تم نشر عقد FakeUSDT على العنوان: ${fakeUSDTAddress}`);

  // عرض معلومات العقد
  console.log("\nمعلومات العقد:");
  console.log(`الاسم: ${await fakeUSDT.name()}`);
  console.log(`الرمز: ${await fakeUSDT.symbol()}`);
  console.log(`الكسور العشرية: ${await fakeUSDT.decimals()}`);
  console.log(`العرض الكلي: ${await fakeUSDT.totalSupply()}`);

  console.log("\nتحذير: هذا العقد مخصص للأغراض التعليمية فقط ولا يجب استخدامه في أي نشاط احتيالي.");
  console.log("عنوان USDT الرسمي على شبكة Ethereum هو: 0xdAC17F958D2ee523a2206206994597C13D831ec7");
  console.log(`عنوان العقد المزيف هو: ${fakeUSDTAddress}`);

  // حفظ معلومات العقد في ملف للاستخدام لاحقًا
  const fs = require("fs");
  const contractInfo = {
    address: fakeUSDTAddress,
    network: hre.network.name,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
  };

  fs.writeFileSync(
    "fake-usdt-info.json",
    JSON.stringify(contractInfo, null, 2)
  );
  console.log("تم حفظ معلومات العقد في ملف fake-usdt-info.json");
}

// تنفيذ السكريبت
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
