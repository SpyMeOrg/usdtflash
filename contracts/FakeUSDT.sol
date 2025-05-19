// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FakeUSDT
 * @dev هذا العقد هو محاكاة لتوكن USDT الحقيقي للأغراض التعليمية فقط.
 * تحذير: هذا العقد مخصص للتعليم فقط ولا يجب استخدامه في أي نشاط احتيالي.
 * الهدف هو توعية المستخدمين بكيفية التعرف على التوكنات المزيفة.
 */
contract FakeUSDT is ERC20, Ownable {
    uint8 private _decimals = 6;

    /**
     * @dev يقوم بإنشاء توكن ERC20 مزيف بنفس خصائص USDT الحقيقي
     * الاسم: Tether USD
     * الرمز: USDT
     * الكسور العشرية: 6
     */
    constructor() ERC20("Tether USD", "USDT") Ownable(msg.sender) {
        // لا يتم إنشاء أي توكنات في البداية
    }

    /**
     * @dev يعيد عدد الكسور العشرية للتوكن
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev يسمح لمالك العقد بإنشاء توكنات جديدة وإرسالها إلى عنوان محدد
     * @param to العنوان الذي سيتم إرسال التوكنات إليه
     * @param amount كمية التوكنات التي سيتم إنشاؤها
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev يسمح لمالك العقد بحرق توكنات من عنوان محدد
     * @param from العنوان الذي سيتم حرق التوكنات منه
     * @param amount كمية التوكنات التي سيتم حرقها
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
}
