const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FakeUSDT", function () {
  let fakeUSDT;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // الحصول على الحسابات التي سيتم استخدامها في الاختبارات
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // نشر العقد
    const FakeUSDT = await ethers.getContractFactory("FakeUSDT");
    fakeUSDT = await FakeUSDT.deploy();
  });

  describe("النشر", function () {
    it("يجب أن يكون اسم التوكن 'Tether USD'", async function () {
      expect(await fakeUSDT.name()).to.equal("Tether USD");
    });

    it("يجب أن يكون رمز التوكن 'USDT'", async function () {
      expect(await fakeUSDT.symbol()).to.equal("USDT");
    });

    it("يجب أن يكون عدد الكسور العشرية 6", async function () {
      expect(await fakeUSDT.decimals()).to.equal(6);
    });

    it("يجب أن يكون العرض الكلي الأولي 0", async function () {
      expect(await fakeUSDT.totalSupply()).to.equal(0);
    });

    it("يجب أن يكون المالك هو الحساب الذي قام بنشر العقد", async function () {
      expect(await fakeUSDT.owner()).to.equal(owner.address);
    });
  });

  describe("إنشاء التوكنات", function () {
    it("يجب أن يسمح للمالك بإنشاء توكنات جديدة", async function () {
      const amount = ethers.parseUnits("1000", 6); // 1000 USDT
      await fakeUSDT.mint(addr1.address, amount);
      
      expect(await fakeUSDT.totalSupply()).to.equal(amount);
      expect(await fakeUSDT.balanceOf(addr1.address)).to.equal(amount);
    });

    it("يجب أن يمنع غير المالك من إنشاء توكنات جديدة", async function () {
      const amount = ethers.parseUnits("1000", 6); // 1000 USDT
      
      await expect(
        fakeUSDT.connect(addr1).mint(addr1.address, amount)
      ).to.be.revertedWithCustomError(fakeUSDT, "OwnableUnauthorizedAccount");
    });
  });

  describe("حرق التوكنات", function () {
    beforeEach(async function () {
      // إنشاء بعض التوكنات لاستخدامها في الاختبارات
      const amount = ethers.parseUnits("1000", 6); // 1000 USDT
      await fakeUSDT.mint(addr1.address, amount);
    });

    it("يجب أن يسمح للمالك بحرق التوكنات", async function () {
      const burnAmount = ethers.parseUnits("500", 6); // 500 USDT
      await fakeUSDT.burn(addr1.address, burnAmount);
      
      expect(await fakeUSDT.totalSupply()).to.equal(ethers.parseUnits("500", 6));
      expect(await fakeUSDT.balanceOf(addr1.address)).to.equal(ethers.parseUnits("500", 6));
    });

    it("يجب أن يمنع غير المالك من حرق التوكنات", async function () {
      const burnAmount = ethers.parseUnits("500", 6); // 500 USDT
      
      await expect(
        fakeUSDT.connect(addr1).burn(addr1.address, burnAmount)
      ).to.be.revertedWithCustomError(fakeUSDT, "OwnableUnauthorizedAccount");
    });
  });

  describe("تحويل التوكنات", function () {
    beforeEach(async function () {
      // إنشاء بعض التوكنات لاستخدامها في الاختبارات
      const amount = ethers.parseUnits("1000", 6); // 1000 USDT
      await fakeUSDT.mint(addr1.address, amount);
    });

    it("يجب أن يسمح للمستخدمين بتحويل التوكنات", async function () {
      const transferAmount = ethers.parseUnits("500", 6); // 500 USDT
      await fakeUSDT.connect(addr1).transfer(addr2.address, transferAmount);
      
      expect(await fakeUSDT.balanceOf(addr1.address)).to.equal(ethers.parseUnits("500", 6));
      expect(await fakeUSDT.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("يجب أن يفشل التحويل إذا لم يكن لدى المرسل رصيد كافٍ", async function () {
      const transferAmount = ethers.parseUnits("1500", 6); // 1500 USDT
      
      await expect(
        fakeUSDT.connect(addr1).transfer(addr2.address, transferAmount)
      ).to.be.reverted;
    });
  });
});
