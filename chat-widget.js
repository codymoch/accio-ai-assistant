(function() {
    'use strict';
    
    console.log('Chat widget script loaded from external file');
    
    // Data Dictionary and Sample Data
const DATA_DICTIONARY = `# Accio Data - Order Export Data Dictionary

## Column Definitions:

**Account & User Information:**
- Account: The client company account name (e.g., Home Depot, Lowes, Sams Club, Target, Walmart, Amazon, etc.)
- UserID: The user who created the order within the account
- Applicant ID: Unique identifier for the applicant (if assigned)

**Order Hierarchy:**
- Master Order Number: Always 0 when new order created. When additional packages added, shows original Order Number
- Order Number: Unique identifier for each package ordered
- Suborder Number: 0 for package container, unique numbers for each search within package

**Financial:**
- Addon Subtotal: Fees charged for this search/package
- Billed State/Court Fees: Courthouse fees if applicable (can include dollar amounts like "$44.55")
- Data Cost: Cost that vendor charges for the data

**Applicant:**
- First Name, Middle Name, Last Name, Name Suffix: Applicant information

**Package/Product:**
- Package: Package/product ordered (A La Carte, Basic Package, Delivery Driver, Volunteer, Professional, etc.)
- Request Type: Specific search type (National Criminal, Employment_verification, MVR, SSN Trace, County Criminal, Drug Test, Education Verification, Sex Offender, etc.)
- Billing Identifier 1: Additional billing identifier (e.g., "Site 1", "Store 405", "DC 3412")

**Timing:**
- TAT (days): Turnaround time in days. 0 or empty if not completed
- Time Entered: When order/search entered system
- Time Component Completed: When search component completed
- Time First Completed: When first marked complete

**Vendor & Results:**
- Vendor 1 Name: Vendor/supplier who processed (Talx, Truv, Data Divers, Samba, Drippin Data, Equifax, eScreen, NSC, STAYCLEAR MONITOR, ACCIOTEST, Researcher1, etc.)
- Component Disposition: Result/status ("verified", "unable to verify", "unknown", "clear", "negative", empty = pending)
- Vendor 1 Supplier Fee: Fee charged by supplier

## Business Logic:
- Suborder = 0: Package container (no vendor processing)
- Suborder > 0: Individual searches within package
- TAT = 0 or empty: Not completed or just completed
- Master Order Number > 0: Additional package added to existing order
- Empty Time Completed: Still pending/in progress

## Client Accounts in Dataset:
Major retail: Home Depot, Lowes, Target, Walmart, Sams Club, Costco, Best Buy
Pharmacies: CVS Pharmacy, Walgreens
Grocery: Kroger
Logistics: Amazon, FedEx, UPS
Food service: Starbucks, Chipotle, Panda Express, Subway, Papa Johns
Other retail: Dollar General, TJ Maxx
Non-profit: Hill Country Rally for Kids`;

const ORDERS_CSV = `Account,UserID,First name,Middle name,Last name,Name suffix,Master Order number,Order number,Suborder number,Time Entered,Request Type,Time first completed,Addon subtotal,Billed state/court fees,Package,Billing Identifier 1,Time Component Completed,Applicant ID,Component Disposition,TAT (days),Vendor 1 Name
Home Depot,Sue01,Bob,,Jones,,0,5773,0,1/8/26 11:22,A La Carte package,1/9/26 11:32,0,0,A La Carte,,1/9/26 11:32,,,1.006898148,
Home Depot,Sue01,Bob,,Jones,,0,5773,925015,1/8/26 11:22,Employment_verification,1/9/26 11:32,90,0,A La Carte,,1/9/26 11:32,,unknown,1.006898148,Talx
Home Depot,Sue01,Mark,,Smith,,0,5774,0,1/8/26 13:00,A La Carte package,1/8/26 13:53,0,0,A La Carte,,1/8/26 13:53,,,0.036678241,
Home Depot,Sue01,Mark,,Smith,,0,5774,925016,1/8/26 13:00,Employment_verification,1/8/26 13:53,90,0,A La Carte,,1/8/26 13:53,,verified,0.036678241,Talx
Lowes,Jim22,Sally,,Wright,,0,5776,0,1/8/26 14:17,A La Carte package,1/9/26 14:28,0,0,A La Carte,,1/9/26 14:28,,,1.007673611,
Lowes,Jim22,Sally,,Wright,,0,5776,925018,1/8/26 14:17,Employment_verification,1/9/26 14:28,90,0,A La Carte,,1/9/26 14:28,,unable to verify,1.007673611,Truv
Lowes,Hank1,Sue,,Smith,,0,5791,0,1/17/26 5:05,Basic Package package,,0,0,Basic Package,,,,,0,
Lowes,Hank1,Sue,,Smith,,0,5791,925034,1/17/26 5:05,National Alias Criminal,,15,0,Basic Package,,,,unknown,0,Data Divers
Lowes,Hank1,Sue,,Smith,,5791,6000,0,1/17/26 5:05,Delivery Driver package,,88,0,Delivery Driver,,,,,0,
Lowes,Hank1,Sue,,Smith,,5791,6000,925033,1/17/26 5:05,MVR,,0,0,Delivery Driver,,,,unknown,0,Samba
Sams Club,GiGi,Johnny,,Bad,,0,5796,0,1/19/26 10:42,Volunteer package,,16,0,Volunteer,,,,,0,
Sams Club,GiGi,Johnny,,Bad,,0,5796,925037,1/19/26 10:42,Sex Offender,,0,0,Volunteer,,,,unknown,0,Drippin Data
Sams Club,GiGi,Jake,,Smith,,0,9901,0,1/19/26 10:42,Professional Package,,225,0,Professional,Site 1,1/19/26 10:42,,,0,
Sams Club,GiGi,Jake,,Smith,,0,9901,4555,1/15/26 10:42,SSN Trace,1/15/26 11:42,0,0,Professional,Site 1,1/19/26 10:42,,unknown,0.041666667,Drippin Data
Sams Club,GiGi,Jake,,Smith,,0,9901,4556,1/15/26 10:42,National Alias Criminal,1/22/26 10:42,0,,Professional,Site 1,1/19/26 10:42,,,7,Data Divers
Sams Club,GiGi,Jake,,Smith,,0,9901,4557,1/15/26 10:42,County Criminal,1/23/26 10:42,0,$44.55,Professional,Site 1,1/19/26 10:42,,,8,Equifax
Sams Club,GiGi,Jake,,Smith,,0,9901,4558,1/15/26 10:42,County Criminal,1/24/26 10:42,0,$125.00,Professional,Site 1,1/19/26 10:42,,,9,Equifax
Sams Club,GiGi,Jake,,Smith,,0,9901,4559,1/15/26 10:42,MVR,1/16/26 10:42,0,,Professional,Site 1,1/19/26 10:42,,,1,Samba
Sams Club,GiGi,Jake,,Smith,,0,9901,4600,1/15/26 10:42,Drug Test,1/17/26 10:42,0,,Professional,Site 1,1/19/26 10:42,,,2,eScreen
Sams Club,GiGi,Jake,,Smith,,0,9901,4601,1/15/26 10:42,Education Verification,1/18/26 10:42,44,,Professional,Site 1,1/19/26 10:42,,,3,NSC
Sams Club,GiGi,Jake,,Smith,,0,9901,4602,1/15/26 10:42,Employment_verification,1/19/26 10:42,88,,Professional,Site 1,1/19/26 10:42,,,4,Talx
Hill Country Rally for Kids,hcrally,759106,810372,0,1/10/25 5:06,monitor hiddenpackage package,2/11/25 8:53,3,0,monitor hiddenpackage,,2/11/25 8:53,,,0,
Hill Country Rally for Kids,hcrally,759106,810372,1637822,1/10/25 5:06,National Criminal,2/11/25 8:53,0,1,monitor hiddenpackage,,2/11/25 8:53,,clear,22.15790558,STAYCLEAR MONITOR
Hill Country Rally for Kids,hcrally,759106,810915,0,2/10/25 5:06,monitor hiddenpackage package,2/14/25 12:36,3,0,monitor hiddenpackage,,2/14/25 12:36,,,0,
Hill Country Rally for Kids,hcrally,759106,810915,1638942,2/10/25 5:06,National Criminal,2/14/25 12:36,0,1,monitor hiddenpackage,,2/14/25 12:36,,clear,4.312488556,STAYCLEAR MONITOR
Hill Country Rally for Kids,hcrally,0,811932,0,4/28/25 10:17,A La Carte package,,20,0,A La Carte,,,,,-1,
Hill Country Rally for Kids,hcrally,0,811932,1640657,4/28/25 10:17,AIM,4/28/25 10:17,4,0.25,A La Carte,,4/28/25 10:17,,clear,6.94444E-05,ACCIOTEST
Hill Country Rally for Kids,hcrally,0,811932,1640658,4/28/25 10:17,FACIS,4/28/25 10:21,0,0,A La Carte,,4/28/25 10:21,,clear,0.002685185,Researcher1
Hill Country Rally for Kids,hcrally,0,811932,1640659,4/28/25 10:17,National Criminal,,0,1.25,A La Carte,,,,,-1,DEMO MJD WORK QUEUE
Hill Country Rally for Kids,hcrally,813224,813225,0,10/26/25 9:50,A La Carte package,10/26/25 9:50,20,0,A La Carte,,10/26/25 9:50,,,-1,
Hill Country Rally for Kids,hcrally,813224,813225,1643491,10/26/25 9:50,AIM,10/26/25 9:50,4,0.25,A La Carte,,10/26/25 9:50,,clear,1.15741E-05,ACCIOTEST
Target,Maria99,Jennifer,L,Thompson,,0,6100,0,1/10/26 8:15,Professional Package,1/14/26 9:22,215,0,Professional,Store 405,1/14/26 9:22,,,4.045138889,
Target,Maria99,Jennifer,L,Thompson,,0,6100,5001,1/10/26 8:15,SSN Trace,1/10/26 9:00,0,0,Professional,Store 405,1/10/26 9:00,,verified,0.03125,Drippin Data
Target,Maria99,Jennifer,L,Thompson,,0,6100,5002,1/10/26 8:15,National Alias Criminal,1/13/26 10:15,0,,Professional,Store 405,1/13/26 10:15,,clear,3.083333333,Data Divers
Target,Maria99,Jennifer,L,Thompson,,0,6100,5003,1/10/26 8:15,County Criminal,1/14/26 9:22,0,$38.00,Professional,Store 405,1/14/26 9:22,,clear,4.045138889,Equifax
Target,Maria99,Jennifer,L,Thompson,,0,6100,5004,1/10/26 8:15,Employment_verification,1/12/26 14:30,85,,Professional,Store 405,1/12/26 14:30,,verified,2.260416667,Talx
Walmart,JohnB,Michael,,Rodriguez,,0,6150,0,1/11/26 13:45,Basic Package package,1/12/26 11:20,0,0,Basic Package,DC 3412,1/12/26 11:20,,,0.904513889,
Walmart,JohnB,Michael,,Rodriguez,,0,6150,5100,1/11/26 13:45,National Alias Criminal,1/12/26 11:20,18,0,Basic Package,DC 3412,1/12/26 11:20,,clear,0.904513889,Data Divers
Walmart,SarahK,Lisa,Marie,Garcia,,0,6175,0,1/12/26 9:30,Delivery Driver package,1/14/26 16:45,95,0,Delivery Driver,Region 5,1/14/26 16:45,,,2.302777778,
Walmart,SarahK,Lisa,Marie,Garcia,,0,6175,5125,1/12/26 9:30,MVR,1/13/26 10:15,0,,Delivery Driver,Region 5,1/13/26 10:15,,clear,1.034722222,Samba
Walmart,SarahK,Lisa,Marie,Garcia,,0,6175,5126,1/12/26 9:30,National Alias Criminal,1/14/26 16:45,15,0,Delivery Driver,Region 5,1/14/26 16:45,,clear,2.302777778,Data Divers
Amazon,Tech12,David,,Chen,,0,6200,0,1/13/26 7:00,Professional Package,1/17/26 12:30,240,0,Professional,FC ATL2,1/17/26 12:30,,,4.229166667,
Amazon,Tech12,David,,Chen,,0,6200,5200,1/13/26 7:00,SSN Trace,1/13/26 8:15,0,0,Professional,FC ATL2,1/13/26 8:15,,verified,0.052083333,Drippin Data
Amazon,Tech12,David,,Chen,,0,6200,5201,1/13/26 7:00,National Alias Criminal,1/16/26 9:45,0,,Professional,FC ATL2,1/16/26 9:45,,clear,3.114583333,Data Divers
Amazon,Tech12,David,,Chen,,0,6200,5202,1/13/26 7:00,County Criminal,1/17/26 12:30,0,$52.75,Professional,FC ATL2,1/17/26 12:30,,clear,4.229166667,Equifax
Amazon,Tech12,David,,Chen,,0,6200,5203,1/13/26 7:00,Drug Test,1/14/26 10:00,0,,Professional,FC ATL2,1/14/26 10:00,,negative,1.125,eScreen
Amazon,Tech12,David,,Chen,,0,6200,5204,1/13/26 7:00,Education Verification,1/16/26 15:20,50,,Professional,FC ATL2,1/16/26 15:20,,verified,3.347222222,NSC
Costco,AdminHR,Patricia,,Williams,,0,6250,0,1/14/26 10:00,Basic Package package,1/15/26 14:30,0,0,Basic Package,Location 1212,1/15/26 14:30,,,1.1875,
Costco,AdminHR,Patricia,,Williams,,0,6250,5250,1/14/26 10:00,National Alias Criminal,1/15/26 14:30,20,0,Basic Package,Location 1212,1/15/26 14:30,,clear,1.1875,Data Divers
CVS Pharmacy,Betty22,Robert,J,Martinez,,0,6300,0,1/15/26 11:20,A La Carte package,1/17/26 9:15,0,0,A La Carte,Region Northeast,1/17/26 9:15,,,1.911458333,
CVS Pharmacy,Betty22,Robert,J,Martinez,,0,6300,5300,1/15/26 11:20,Employment_verification,1/17/26 9:15,90,0,A La Carte,Region Northeast,1/17/26 9:15,,verified,1.911458333,Truv
CVS Pharmacy,Betty22,Robert,J,Martinez,,0,6300,5301,1/15/26 11:20,Drug Test,1/16/26 8:30,0,,A La Carte,Region Northeast,1/16/26 8:30,,negative,0.8819444444,eScreen
Kroger,ManagerJ,Amanda,,Brown,,0,6350,0,1/16/26 14:30,Professional Package,1/20/26 16:45,230,0,Professional,Store 8821,1/20/26 16:45,,,4.09375,
Kroger,ManagerJ,Amanda,,Brown,,0,6350,5350,1/16/26 14:30,SSN Trace,1/16/26 15:45,0,0,Professional,Store 8821,1/16/26 15:45,,verified,0.052083333,Drippin Data
Kroger,ManagerJ,Amanda,,Brown,,0,6350,5351,1/16/26 14:30,National Alias Criminal,1/19/26 10:20,0,,Professional,Store 8821,1/19/26 10:20,,clear,2.829861111,Data Divers
Kroger,ManagerJ,Amanda,,Brown,,0,6350,5352,1/16/26 14:30,County Criminal,1/20/26 16:45,0,$67.50,Professional,Store 8821,1/20/26 16:45,,clear,4.09375,Equifax
Kroger,ManagerJ,Amanda,,Brown,,0,6350,5353,1/16/26 14:30,Employment_verification,1/18/26 13:00,88,,Professional,Store 8821,1/18/26 13:00,,unable to verify,1.940972222,Talx
Starbucks,CoffeeMgr,Christopher,,Davis,,0,6400,0,1/17/26 8:45,Basic Package package,1/18/26 10:30,0,0,Basic Package,District 44,1/18/26 10:30,,,1.072916667,
Starbucks,CoffeeMgr,Christopher,,Davis,,0,6400,5400,1/17/26 8:45,National Alias Criminal,1/18/26 10:30,18,0,Basic Package,District 44,1/18/26 10:30,,clear,1.072916667,Data Divers
FedEx,LogisticsA,Jessica,,Miller,,0,6450,0,1/18/26 6:00,Delivery Driver package,1/20/26 14:20,100,0,Delivery Driver,Hub DFW,1/20/26 14:20,,,2.347222222,
FedEx,LogisticsA,Jessica,,Miller,,0,6450,5450,1/18/26 6:00,MVR,1/19/26 9:30,0,,Delivery Driver,Hub DFW,1/19/26 9:30,,clear,1.145833333,Samba
FedEx,LogisticsA,Jessica,,Miller,,0,6450,5451,1/18/26 6:00,National Alias Criminal,1/20/26 14:20,15,0,Delivery Driver,Hub DFW,1/20/26 14:20,,clear,2.347222222,Data Divers
FedEx,LogisticsA,Jessica,,Miller,,0,6450,5452,1/18/26 6:00,Drug Test,1/19/26 7:15,0,,Delivery Driver,Hub DFW,1/19/26 7:15,,negative,1.052083333,eScreen
UPS,ShipHR,Matthew,,Wilson,,0,6500,0,1/19/26 7:30,Delivery Driver package,,105,0,Delivery Driver,Facility ATL,,,,,0,
UPS,ShipHR,Matthew,,Wilson,,0,6500,5500,1/19/26 7:30,MVR,,0,,Delivery Driver,Facility ATL,,,,0,Samba
UPS,ShipHR,Matthew,,Wilson,,0,6500,5501,1/19/26 7:30,National Alias Criminal,,18,0,Delivery Driver,Facility ATL,,,,0,Data Divers
Chipotle,FoodHR1,Sarah,Ann,Moore,,0,6550,0,1/20/26 12:00,Basic Package package,1/21/26 11:45,0,0,Basic Package,Location 992,1/21/26 11:45,,,0.989583333,
Chipotle,FoodHR1,Sarah,Ann,Moore,,0,6550,5550,1/20/26 12:00,National Alias Criminal,1/21/26 11:45,18,0,Basic Package,Location 992,1/21/26 11:45,,clear,0.989583333,Data Divers
Dollar General,StoreOps,Daniel,,Taylor,,0,6600,0,1/21/26 9:15,A La Carte package,1/22/26 13:30,0,0,A La Carte,Region South,1/22/26 13:30,,,1.177083333,
Dollar General,StoreOps,Daniel,,Taylor,,0,6600,5600,1/21/26 9:15,Employment_verification,1/22/26 13:30,85,0,A La Carte,Region South,1/22/26 13:30,,verified,1.177083333,Talx
TJ Maxx,RetailHR,Emily,,Anderson,,0,6650,0,1/22/26 10:30,Professional Package,1/25/26 15:20,220,0,Professional,Store 5512,1/25/26 15:20,,,3.201388889,
TJ Maxx,RetailHR,Emily,,Anderson,,0,6650,5650,1/22/26 10:30,SSN Trace,1/22/26 11:30,0,0,Professional,Store 5512,1/22/26 11:30,,verified,0.041666667,Drippin Data
TJ Maxx,RetailHR,Emily,,Anderson,,0,6650,5651,1/22/26 10:30,National Alias Criminal,1/24/26 9:45,0,,Professional,Store 5512,1/24/26 9:45,,clear,1.96875,Data Divers
TJ Maxx,RetailHR,Emily,,Anderson,,0,6650,5652,1/22/26 10:30,County Criminal,1/25/26 15:20,0,$41.25,Professional,Store 5512,1/25/26 15:20,,clear,3.201388889,Equifax
Home Depot,Sue01,Carlos,,Hernandez,,0,6700,0,1/23/26 13:20,Basic Package package,1/24/26 10:15,0,0,Basic Package,Store 1445,1/24/26 10:15,,,0.871527778,
Home Depot,Sue01,Carlos,,Hernandez,,0,6700,5700,1/23/26 13:20,National Alias Criminal,1/24/26 10:15,20,0,Basic Package,Store 1445,1/24/26 10:15,,clear,0.871527778,Data Divers
Lowes,Jim22,Michelle,,White,,0,6750,0,1/24/26 8:00,Delivery Driver package,1/26/26 12:30,98,0,Delivery Driver,DC 5501,1/26/26 12:30,,,2.1875,
Lowes,Jim22,Michelle,,White,,0,6750,5750,1/24/26 8:00,MVR,1/25/26 9:45,0,,Delivery Driver,DC 5501,1/25/26 9:45,,clear,1.072916667,Samba
Lowes,Jim22,Michelle,,White,,0,6750,5751,1/24/26 8:00,National Alias Criminal,1/26/26 12:30,18,0,Delivery Driver,DC 5501,1/26/26 12:30,,clear,2.1875,Data Divers
Best Buy,TechRecruit,Kevin,,Jackson,,0,6800,0,1/25/26 11:00,Professional Package,1/28/26 14:45,235,0,Professional,Store 2204,1/28/26 14:45,,,3.155208333,
Best Buy,TechRecruit,Kevin,,Jackson,,0,6800,5800,1/25/26 11:00,SSN Trace,1/25/26 12:00,0,0,Professional,Store 2204,1/25/26 12:00,,verified,0.041666667,Drippin Data
Best Buy,TechRecruit,Kevin,,Jackson,,0,6800,5801,1/25/26 11:00,National Alias Criminal,1/27/26 10:30,0,,Professional,Store 2204,1/27/26 10:30,,clear,1.979166667,Data Divers
Best Buy,TechRecruit,Kevin,,Jackson,,0,6800,5802,1/25/26 11:00,County Criminal,1/28/26 14:45,0,$58.90,Professional,Store 2204,1/28/26 14:45,,clear,3.155208333,Equifax
Best Buy,TechRecruit,Kevin,,Jackson,,0,6800,5803,1/25/26 11:00,Education Verification,1/27/26 16:20,48,,Professional,Store 2204,1/27/26 16:20,,verified,2.222222222,NSC
Walgreens,PharmHR,Laura,,Thomas,,0,6850,0,1/26/26 9:45,A La Carte package,1/28/26 8:30,0,0,A La Carte,District 88,1/28/26 8:30,,,1.928472222,
Walgreens,PharmHR,Laura,,Thomas,,0,6850,5850,1/26/26 9:45,Employment_verification,1/28/26 8:30,92,0,A La Carte,District 88,1/28/26 8:30,,verified,1.928472222,Truv
Walgreens,PharmHR,Laura,,Thomas,,0,6850,5851,1/26/26 9:45,Drug Test,1/27/26 10:00,0,,A La Carte,District 88,1/27/26 10:00,,negative,1.010416667,eScreen
Panda Express,RestMgr,Joseph,,Lee,,0,6900,0,1/27/26 14:15,Basic Package package,1/28/26 13:20,0,0,Basic Package,Location 334,1/28/26 13:20,,,0.962847222,
Panda Express,RestMgr,Joseph,,Lee,,0,6900,5900,1/27/26 14:15,National Alias Criminal,1/28/26 13:20,18,0,Basic Package,Location 334,1/28/26 13:20,,clear,0.962847222,Data Divers
Subway,FranchiseOps,Nancy,,Harris,,0,6950,0,1/28/26 7:30,A La Carte package,,0,0,A La Carte,Store 7723,,,,,0,
Subway,FranchiseOps,Nancy,,Harris,,0,6950,5950,1/28/26 7:30,Employment_verification,,88,0,A La Carte,Store 7723,,,,0,Talx
Papa Johns,PizzaHR,Brian,,Martin,,0,7000,0,1/29/26 10:00,Basic Package package,1/30/26 9:45,0,0,Basic Package,Franchise 12,1/30/26 9:45,,,0.989583333,
Papa Johns,PizzaHR,Brian,,Martin,,0,7000,6000,1/29/26 10:00,National Alias Criminal,1/30/26 9:45,18,0,Basic Package,Franchise 12,1/30/26 9:45,,clear,0.989583333,Data Divers`;
    
    function initializeChat() {
        var container = document.getElementById('claudeChatWidget');
        if (!container) {
            console.log('Chat widget not found, retrying...');
            setTimeout(initializeChat, 100);
            return;
        }
        
        var messagesContainer = document.getElementById('chatMessages');
        var messageInput = document.getElementById('messageInput');
        var sendButton = document.getElementById('sendButton');
        
        if (!messagesContainer || !messageInput || !sendButton) {
            console.log('Chat elements not ready, retrying...');
            setTimeout(initializeChat, 100);
            return;
        }
        
        console.log('Chat widget initialized!');
        
        var conversationHistory = [];
        var isProcessing = false;
        
        function addMessage(content, role) {
            var messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + role;
            messageDiv.textContent = content;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function showTypingIndicator() {
            var existingTyping = document.getElementById('typingIndicator');
            if (existingTyping) return;
            
            var typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator';
            typingDiv.id = 'typingIndicator';
            typingDiv.textContent = 'Claude is typing...';
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function removeTypingIndicator() {
            var typingDiv = document.getElementById('typingIndicator');
            if (typingDiv) {
                typingDiv.remove();
            }
        }
        
        function sendMessage() {
            if (isProcessing) return;
            
            var message = messageInput.value.trim();
            if (!message) return;
            
            console.log('Sending message:', message);
            
            isProcessing = true;
            messageInput.disabled = true;
            sendButton.disabled = true;
            
            addMessage(message, 'user');
            messageInput.value = '';
            
            conversationHistory.push({
                role: 'user',
                content: message
            });
            
            showTypingIndicator();
            
            var systemPrompt = 'You are an AI assistant for Accio Data background screening analytics.\n\n' +
                'Here is the data dictionary explaining the CSV structure:\n' + DATA_DICTIONARY + '\n\n' +
                'Here is the order export data with detailed order and search information:\n' + ORDERS_CSV + '\n\n' +
                'Answer questions about this data. Analyze the CSV to provide accurate, specific answers with numbers and details. Format your responses clearly. This is sample data from their actual export format.';
            
            fetch('https://accio-ai-assistant.vercel.app/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 1024,
                    system: systemPrompt,
                    messages: conversationHistory
                })
            })
            .then(function(response) {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(function(data) {
                console.log('Response data:', data);
                removeTypingIndicator();
                
                if (data.error) {
                    throw new Error(data.error.message || 'Failed to get response');
                }
                
                var assistantMessage = data.content[0].text;
                
                conversationHistory.push({
                    role: 'assistant',
                    content: assistantMessage
                });
                
                addMessage(assistantMessage, 'assistant');
            })
            .catch(function(error) {
                console.error('Error:', error);
                removeTypingIndicator();
                addMessage('Error: ' + error.message, 'error');
            })
            .finally(function() {
                isProcessing = false;
                messageInput.disabled = false;
                sendButton.disabled = false;
                messageInput.focus();
            });
        }
        
        sendButton.addEventListener('click', sendMessage);
        
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        messageInput.focus();
        console.log('Chat widget ready!');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeChat);
    } else {
        initializeChat();
    }
})();
