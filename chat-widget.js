(function() {
    'use strict';
    
    console.log('Chat widget script loaded from external file');
    
    // Data Dictionary and Sample Data
    const DATA_DICTIONARY = `# Accio Data - Order Export Data Dictionary

## Column Definitions:

**Company Information:**
- Company Name: The employer/client company name
- Account: The account identifier used in Accio Data system

**Order Hierarchy:**
- Master Order Number: Always 0 when new order created. When additional packages added, shows original Order Number
- Order Number: Unique identifier for each package ordered
- Suborder Number: 0 for package container, unique numbers for each search within package

**Financial:**
- Addon Subtotal: Fees charged for this search/package
- Data Cost: Cost that vendor charges for the data
- Billed State/Court Fees: Courthouse fees if applicable

**Applicant:**
- First Name, Last Name: Applicant information

**Package/Product:**
- Pricebook: Pricebook this order was created from
- Package: Package/product ordered
- Request Type: Specific search type (National Criminal, AIM, FACIS, etc.)

**Timing:**
- TAT (days): Turnaround time in days. -1 if not completed
- Time Entered: When order/search entered system
- Time Component Completed: When search component completed
- Time First Completed: When first marked complete

**Vendor:**
- Vendor 1 Name: Vendor/supplier who processed (STAYCLEAR MONITOR, ACCIOTEST, Researcher1, etc.)
- Vendor 1 Disposition: Result/status ("clear" = no issues, empty = pending)
- Vendor 1 Supplier Fee: Fee charged by supplier

## Business Logic:
- Suborder = 0: Package container
- Suborder > 0: Individual searches within package
- TAT = -1: Not completed
- Master Order Number > 0: Recurring monitoring check
- "clear" disposition: No issues found
- Empty Time Completed: Still pending`;

    const ORDERS_CSV = `Company Name,Account,Master Order number,Order number,Suborder number,Addon subtotal,Data Cost,Billed state/court fees,First name,Last name,Pricebook,Package,Request Type,TAT (days),Time Entered,Time Component Completed,Time first completed,Vendor 1 Name,Vendor 1 Disposition,Vendor 1 Supplier Fee
Hill Country Rally for Kids,hcrally,759106,810372,0,3,0,0,Mark,Monitoryes,codypricebook,monitor hiddenpackage,monitor hiddenpackage package,-1,1/10/25 5:06,,2/11/25 8:53,,,0
Hill Country Rally for Kids,hcrally,759106,810372,1637822,0,1,0,Mark,Monitoryes,codypricebook,monitor hiddenpackage,National Criminal,22.15790558,1/10/25 5:06,2/11/25 8:53,2/11/25 8:53,STAYCLEAR MONITOR,clear,1
Hill Country Rally for Kids,hcrally,759106,810915,0,3,0,0,Mark,Monitoryes,codypricebook,monitor hiddenpackage,monitor hiddenpackage package,-1,2/10/25 5:06,,2/14/25 12:36,,,0
Hill Country Rally for Kids,hcrally,759106,810915,1638942,0,1,0,Mark,Monitoryes,codypricebook,monitor hiddenpackage,National Criminal,4.312488556,2/10/25 5:06,2/14/25 12:36,2/14/25 12:36,STAYCLEAR MONITOR,clear,1
Hill Country Rally for Kids,hcrally,0,811932,0,20,0,0,Jack,Smith,codypricebook,A La Carte,A La Carte package,-1,4/28/25 10:17,,,,,0
Hill Country Rally for Kids,hcrally,0,811932,1640657,4,0.25,0,Jack,Smith,codypricebook,A La Carte,AIM,6.94444E-05,4/28/25 10:17,4/28/25 10:17,,ACCIOTEST,clear,0.25
Hill Country Rally for Kids,hcrally,0,811932,1640658,0,0,0,Jack,Smith,codypricebook,A La Carte,FACIS,0.002685185,4/28/25 10:17,4/28/25 10:21,,Researcher1,clear,0
Hill Country Rally for Kids,hcrally,0,811932,1640659,0,1.25,0,Jack,Smith,codypricebook,A La Carte,National Criminal,-1,4/28/25 10:17,,,DEMO MJD WORK QUEUE,,1.25
Hill Country Rally for Kids,hcrally,813224,813225,0,20,0,0,ff,ff,codypricebook,A La Carte,A La Carte package,-1,10/26/25 9:50,,10/26/25 9:50,,,0
Hill Country Rally for Kids,hcrally,813224,813225,1643491,4,0.25,0,ff,ff,codypricebook,A La Carte,AIM,1.15741E-05,10/26/25 9:50,10/26/25 9:50,10/26/25 9:50,ACCIOTEST,clear,0.25`;
    
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
